import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseUnits, randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';

import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import useAddressInput from '../hooks/useAddressInput';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

function NewPKey({ sendAddr, newAddr, setNewAddr }) {
  const { network, networkList, handleNetwork } = useNetworks();
  const { coinVal, handleCoinVal, resetCoinVal } = useCoinInput();
  const { recipient, handleRecipient, resetRecipient } = useAddressInput();

  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('');
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  useEffect(() => {
    const InfuraProvider = new ethers.providers.InfuraProvider(network.network);
    // const url = `https://${network.network}.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`;
    // const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = InfuraProvider.getSigner(); //provider should be supported signing
    // console.log(signer);
    // const etherProvider = new ethers.providers.EtherscanProvider(network.network);

    setProvider(InfuraProvider);
  }, [network]);

  useEffect(() => {
    if (newAddr || isClickedBtn) {
      getBalance();
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, newAddr, provider]);

  const createPrivateKey = () => {
    const buf = Buffer.from(randomBytes(32));
    const id = buf.toString('hex');
    const pKey = `0x${id}`;
    console.log(pKey);
    createWalletInstance(pKey);
  };

  const createWalletInstance = async pKey => {
    const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    const addr = ethers.utils.computeAddress(privateKey);
    const publicKey = ethers.utils.computePublicKey(privateKey);
    const addrFromPublic = ethers.utils.computeAddress(publicKey);

    setWallet(wallet);
    setNewAddr(addr);
  };

  const getBalance = async () => {
    const bigNumBalance = await provider.getBalance(newAddr);
    const balance = ethers.utils.formatUnits(bigNumBalance);
    setBalance(balance);
  };

  const getMetaMaskAddr = () => {
    if (!sendAddr) alert('메타마스크에 연결해주세요!');
    else handleRecipient(sendAddr);
  };

  const createTx = async recipient => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt(currGasPrice));
    const gasLimit = ethers.utils.hexlify(21000);
    const value = ethers.utils.parseEther(coinVal);
    const nonce = await provider.getTransactionCount(newAddr, 'pending');
    const tx = { gasPrice, gasLimit, to: recipient, value, nonce };
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
    if (!coinVal) {
      alert('Value를 입력해주세요');
    } else {
      try {
        // 1. raw tx 생성
        const rawTx = await createTx(recipient);
        // 2. signing tx w/pKey
        const signedTx = await wallet.signTransaction(rawTx);
        // 3. sendTx
        const sendTx = await provider.sendTransaction(signedTx);
        const resTx = await provider.waitForTransaction(sendTx.hash);
        if (resTx) {
          setIsClickedBtn(true);
          resetCoinVal();
          resetRecipient();
          alert('Send finished!');
        }
      } catch (error) {
        console.log(error);
        alert('failed to send!!');
      }
    }
  };

  return (
    <div className="container__wallet">
      <button onClick={createPrivateKey} disabled={wallet?.privateKey}>
        New Private Key 생성
      </button>
      <GivenDataForm label={'New Private Key'} value={wallet?.privateKey} />
      <GivenDataForm label={'New Address'} value={wallet?.address} />
      <GivenDataForm label={'Balance'} value={balance} />
      <InputForm label={'To'} onChange={handleRecipient}>
        <button onClick={getMetaMaskAddr}>메타마스크</button>
      </InputForm>
      <InputForm label={'Value'} onChange={handleCoinVal}>
        <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
          {networkList.map(network => (
            <option key={network.id} value={network.network}>
              {network.name}
            </option>
          ))}
        </select>
      </InputForm>
      <button onClick={sendTransaction}>Send</button>
    </div>
  );
}

export default NewPKey;
