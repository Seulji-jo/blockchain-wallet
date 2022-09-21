import React, { useEffect, useState } from 'react';
import { providers, utils, Wallet } from 'ethers';
import { randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

import useNetworks from '../hooks/useNetworks';
import useBalance from '../hooks/useBalance';
import useInput from '../hooks/useInput';

function NewPKey({ sendAddr, newAddr, setNewAddr }) {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const { network, networkList, handleNetwork } = useNetworks();
  const { input, handleInput, changeInput, resetInput } = useInput();
  const { balance, getBalance } = useBalance(provider);

  const createPrivateKey = () => {
    const buf = Buffer.from(randomBytes(32));
    const id = buf.toString('hex');
    const pKey = `0x${id}`;
    createWalletInstance(pKey);
  };

  const createWalletInstance = async privateKey => {
    // privateKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const addr = utils.computeAddress(privateKey);
    const publicKey = utils.computePublicKey(privateKey);
    const addrFromPublic = utils.computeAddress(publicKey);

    setWallet(wallet);
    setNewAddr(addr);
  };

  const getMetaMaskAddr = () => {
    if (!sendAddr) alert('메타마스크에 연결해주세요!');
    else changeInput('to', sendAddr);
  };

  const createTx = async () => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = utils.hexlify(parseInt(currGasPrice));
    const gasLimit = utils.hexlify(21000);
    const value = utils.parseEther(input.value);
    const nonce = await provider.getTransactionCount(newAddr, 'pending');
    const tx = { gasPrice, gasLimit, to: input.to, value, nonce };
    return tx;
  };

  const sendTxFromSigner = async () => {
    let walletSigner = wallet.connect(provider);
    const tx = await createTx();
    try {
      const sendTx = walletSigner.sendTransaction(tx);
      console.dir(sendTx);
      alert('Send finished!');
    } catch (error) {
      alert('failed to send!!');
    }
  };

  const sendTransaction = async () => {
    if (!input.value) {
      alert('Value를 입력해주세요');
    } else {
      try {
        // 1. raw tx 생성
        const rawTx = await createTx();
        // 2. signing tx w/pKey
        const signedTx = await wallet.signTransaction(rawTx);
        // 3. sendTx
        const sendTx = await provider.sendTransaction(signedTx);
        const resTx = await provider.waitForTransaction(sendTx.hash);
        if (resTx) {
          setIsClickedBtn(true);
          // resetCoinVal();
          // resetRecipient();
          resetInput();
          alert('Send finished!');
        }
      } catch (error) {
        console.log(error);
        alert('failed to send!!');
      }
    }
  };

  useEffect(() => {
    const InfuraProvider = new providers.InfuraProvider(network.network);
    setProvider(InfuraProvider);
  }, [network]);

  useEffect(() => {
    if (newAddr || isClickedBtn) {
      getBalance(newAddr);
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, provider, getBalance, newAddr]);

  return (
    <section className="container__wallet">
      <button onClick={createPrivateKey} disabled={wallet?.privateKey}>
        New Private Key 생성
      </button>
      <GivenDataForm label={'New Private Key'} value={wallet?.privateKey} />
      <GivenDataForm label={'New Address'} value={wallet?.address} />
      <GivenDataForm label={'Balance'} value={balance} />
      <InputForm label={'To'} name={'to'} value={input.to} onChange={handleInput}>
        <button onClick={getMetaMaskAddr}>메타마스크</button>
      </InputForm>
      <InputForm label={'Value'} name={'value'} value={input.value} onChange={handleInput}>
        <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
          {networkList.map(network => (
            <option key={network.id} value={network.network}>
              {network.name}
            </option>
          ))}
        </select>
      </InputForm>
      <button onClick={sendTransaction}>Send</button>
    </section>
  );
}

export default NewPKey;
