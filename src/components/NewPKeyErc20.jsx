import React, { useEffect, useState } from 'react';
import { Contract, providers, utils, Wallet } from 'ethers';
import { parseUnits, randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';

import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';
import useNetworks from '../hooks/useNetworks';
import useBalance from '../hooks/useBalance';
import useInput from '../hooks/useInput';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

function NewPKeyPart({ sendAddr, newAddr, setNewAddr }) {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const { network } = useNetworks();
  const { input, handleInput, changeInput, resetInput } = useInput();
  const { balance, getToken, symbol } = useBalance(contract);

  const createWalletInstance = async privateKey => {
    privateKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const addr = utils.computeAddress(privateKey);

    const contractAddr = process.env.REACT_APP_ERC20_CONTRACT;

    const walletSigner = wallet.connect(provider);
    const contract = new Contract(contractAddr, HannahFirstTokenAbi, walletSigner);

    setWallet(wallet);
    setNewAddr(addr);
    setContract(contract);
  };

  const createPrivateKey = () => {
    const buf = Buffer.from(randomBytes(32));
    const id = buf.toString('hex');
    const pKey = `0x${id}`;
    createWalletInstance(pKey);
  };

  const getMetaMaskAddr = () => {
    if (!sendAddr) alert('메타마스크에 연결해주세요!');
    else changeInput('to', sendAddr);
  };

  const sendToken = async () => {
    const tx = await contract.transfer(sendAddr, parseUnits(input.tokenVal));
    const resTx = await provider.waitForTransaction(tx.hash);
    if (resTx) {
      setIsClickedBtn(true);
      resetInput();
      alert('Send finished!');
    }
  };

  useEffect(() => {
    const InfuraProvider = new providers.InfuraProvider(network.network);
    setProvider(InfuraProvider);
  }, [network]);

  useEffect(() => {
    if (newAddr || isClickedBtn) {
      getToken(newAddr);
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, newAddr, getToken]);

  return (
    <div className="container__wallet">
      <button onClick={createPrivateKey} disabled={wallet?.privateKey}>
        New Private Key 생성
      </button>
      <GivenDataForm label={'New Private Key'} value={wallet?.privateKey} />
      <GivenDataForm label={'New Address'} value={wallet?.address} />
      <GivenDataForm label={'Token'} value={balance} symbol={symbol} />
      <InputForm label={'To'} name={'to'} value={input.to} onChange={handleInput}>
        <button onClick={getMetaMaskAddr}>메타마스크</button>
      </InputForm>
      <InputForm label={'Value'} name={'tokenVal'} value={input.tokenVal} onChange={handleInput} />
      <button onClick={sendToken}>Send</button>
      {/* <button onClick={handleTxList}>showTxList</button> */}
    </div>
  );
}

export default NewPKeyPart;
