import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseUnits, randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';

import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import useAddressInput from '../hooks/useAddressInput';

function NewPKeyPart({ sendAddr, newAddr, setNewAddr }) {
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
      console.log('check');
      getBalance();
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, newAddr]);

  const createPrivateKey = () => {
    const buf = Buffer.from(randomBytes(32));
    const id = buf.toString('hex');
    const pKey = `0x${id}`;
    createWalletInstance(pKey);
  };

  const createWalletInstance = async pKey => {
    console.log('pKey: ' + pKey);
    const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    const addr = ethers.utils.computeAddress(privateKey);
    const publicKey = ethers.utils.computePublicKey(privateKey);
    const addrFromPublic = ethers.utils.computeAddress(publicKey);
    console.log(addrFromPublic);

    setWallet(wallet);
    setNewAddr(addr);
  };

  const getBalance = async () => {
    const bigNumBalance = await provider.getBalance(newAddr);
    const balance = ethers.utils.formatUnits(bigNumBalance);
    console.log(balance);
    setBalance(balance);
  };

  const getMetaMaskAddr = () => {
    if (!sendAddr) alert('메타마스크에 연결해주세요!');
    else handleRecipient(sendAddr);
  };

  const createTx = async recipient => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt(currGasPrice));
    console.log(ethers.utils.parseUnits('5', 'gwei'));
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
      // 1. raw tx 생성
      const rawTx = await createTx(recipient);
      console.log('rawTx↴ ');
      console.log(rawTx);
      // 2. signing tx w/pKey
      const signedTx = await wallet.signTransaction(rawTx);
      console.log('signedTx: ' + signedTx);
      // 3. sendTx
      const sendTx = await provider.sendTransaction(signedTx);
      const resTx = await provider.waitForTransaction(sendTx.hash);
      if (resTx) {
        setIsClickedBtn(true);
        resetCoinVal();
        resetRecipient();
        alert('Send finished!');
      }
      console.log('sendTx↴ ');
      console.log(sendTx);
    }
  };

  return (
    <div className="container__wallet">
      <button onClick={createPrivateKey} disabled={wallet?.privateKey}>
        New Private Key 생성
      </button>
      <div className="input__wrapper">
        <label>New Private Key:</label>
        <div className="wallet--value wallet--pkey">{wallet?.privateKey}</div>
      </div>
      <div className="input__wrapper">
        <label>New Address:</label>
        <div className="wallet--value">{wallet?.address}</div>
      </div>
      <div className="input__wrapper">
        <label>Balance:</label>
        <div className="wallet--value">{balance}</div>
      </div>
      <div className="input__wrapper">
        <label htmlFor="coinVal">To: </label>
        <div className="input__row">
          <input type="text" name="coinVal" value={recipient} onChange={handleRecipient} />
          <button onClick={getMetaMaskAddr}>메타마스크</button>
        </div>
      </div>
      <div className="input__wrapper">
        <label htmlFor="coinVal">Value: </label>
        <div className="input__row">
          <input type="text" name="coinVal" onChange={handleCoinVal} value={coinVal} />
          <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
            {networkList.map(network => (
              <option key={network.id} value={network.network}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={sendTransaction}>send to Metamask</button>
    </div>
  );
}

export default NewPKeyPart;
