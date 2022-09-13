import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { formatEther, parseUnits, randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';

import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';
import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import useAddressInput from '../hooks/useAddressInput';

function NewPKeyPart({ sendAddr, newAddr, setNewAddr }) {
  const { network, networkList, handleNetwork } = useNetworks();
  const { coinVal, handleCoinVal, resetCoinVal } = useCoinInput();
  const { recipient, handleRecipient, resetRecipient } = useAddressInput();
  const {
    coinVal: tokenBal,
    handleCoinVal: handleTokenBal,
    resetCoinVal: resetTokenBal,
  } = useCoinInput();

  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [tokenBalance, setTokenBalace] = useState('');
  const [contract, setContract] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  useEffect(() => {
    const InfuraProvider = new ethers.providers.InfuraProvider(network.network);
    // const url = `https://${network.network}.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`;
    // const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
    // console.log(customHttpProvider);

    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = InfuraProvider.getSigner(); //provider should be supported signing
    // console.log(signer);
    const etherProvider = new ethers.providers.EtherscanProvider(network.network);

    setProvider(InfuraProvider);
    const getHistory = async () => {
      // 방법3
      const history = await etherProvider.getHistory('0x33Ddacb5bed0F44B1Cf87626D7a3F64B86aF8752');
      console.log(history);
    };
    getHistory();

    let abi = ['event Transfer(address indexed from, address indexed to, uint value)'];
    let iface = new ethers.utils.Interface(abi);
    console.log(iface);
  }, [network]);

  useEffect(() => {
    if (newAddr || isClickedBtn) {
      console.log('check');
      getTokenBalance();
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, newAddr]);

  const getTokenBalance = async () => {
    const tokenBalance = await contract.balanceOf(newAddr);
    setTokenBalace(ethers.utils.formatUnits(tokenBalance));
    setSymbol(await contract.symbol());
  };

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

    const contractAddr = '0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0';
    console.log(contractAddr);

    const walletSigner = wallet.connect(provider);
    const contract = new ethers.Contract(contractAddr, HannahFirstTokenAbi, walletSigner);
    // const contractWProvider = contract.connect(provider);
    // console.log(contractWProvider);

    setWallet(wallet);
    setNewAddr(addr);
    setContract(contract);
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

  const createTx = async recipient => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt(currGasPrice));
    console.log(ethers.utils.parseUnits('5', 'gwei'));
    const gasLimit = ethers.utils.hexlify(21000);
    const value = ethers.utils.parseEther(coinVal);
    const nonce = await provider.getTransactionCount(newAddr, 'pending');

    const tx = { gasPrice, gasLimit, to: recipient, value, nonce };
    // const fullTx = await wallet.populateTransaction(tx);
    // console.log(fullTx);
    return tx;
  };

  const sendToken = async () => {
    // const txFrom = await contract.transferFrom(newAddr, sendAddr, tokenBal);
    const tx = await contract.transfer(sendAddr, parseUnits(tokenBal));
    const resTx = await provider.waitForTransaction(tx.hash);
    console.log(resTx);
    if (resTx) {
      setIsClickedBtn(true);
      resetCoinVal();
      resetTokenBal();
      resetRecipient();
      alert('Send finished!');
    }
  };

  const getMetaMaskAddr = () => {
    if (!sendAddr) alert('메타마스크에 연결해주세요!');
    else handleRecipient(sendAddr);
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
        <label className="token">Token</label>
        <div className="wallet--value">
          {tokenBalance}
          <span> {symbol}</span>
        </div>
      </div>
      <div className="input__wrapper">
        <label htmlFor="coinVal">To: </label>
        <div className="input__row">
          <input type="text" name="coinVal" value={recipient} onChange={handleRecipient} />
          <button onClick={getMetaMaskAddr}>메타마스크</button>
        </div>
      </div>
      <div className="input__wrapper">
        <label htmlFor="tokenBal">Value: </label>
        <input type="text" name="tokenBal" value={tokenBal} onChange={handleTokenBal} />
      </div>
      <button onClick={sendToken}>Send</button>
      {/* <button onClick={handleTxList}>showTxList</button> */}
    </div>
  );
}

export default NewPKeyPart;
