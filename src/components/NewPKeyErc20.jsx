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

  const createPrivateKey = () => {
    const buf = Buffer.from(randomBytes(32));
    const id = buf.toString('hex');
    const pKey = `0x${id}`;
    createWalletInstance(pKey);
  };

  const createWalletInstance = async pKey => {
    console.log('pKey: ' + pKey);
    const privateKey = '0x15b3eed746443d676410608e93459026a560672cd2032a719cfa2137caa06a80';
    const wallet = new ethers.Wallet(privateKey);
    const addr = ethers.utils.computeAddress(privateKey);
    const publicKey = ethers.utils.computePublicKey(privateKey);
    const addrFromPublic = ethers.utils.computeAddress(publicKey);

    const contractAddr = '0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0';
    console.log(contractAddr);

    const walletSigner = wallet.connect(provider);
    const contract = new ethers.Contract(contractAddr, HannahFirstTokenAbi, walletSigner);
    console.log(contract);
    // const contractWProvider = contract.connect(provider);
    // console.log(contractWProvider);
    const tokenBalance = await contract.balanceOf(addr);
    const test = await contract.balanceOf('0xBAD9d82C5c83f487EbF14BFB4C23BF7719024663');
    console.log(tokenBalance);
    console.log(test);

    console.log('publicKey: ' + publicKey);
    console.log('addrFromPublic: ' + addrFromPublic);

    setWallet(wallet);
    setNewAddr(addr);
    setContract(contract);
    setTokenBalace(ethers.utils.formatUnits(tokenBalance));
    setSymbol(await contract.symbol());
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
    console.log('provider: ');
    console.log(provider);
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt(currGasPrice));
    console.log(ethers.utils.parseUnits('5', 'gwei'));
    const gasLimit = ethers.utils.hexlify(21000);
    const value = ethers.utils.parseEther(coinVal);
    const nonce = await provider.getTransactionCount(newAddr, 'pending');
    console.log('nonce: ' + nonce);

    const tx = { gasPrice, gasLimit, to: recipient, value, nonce };
    console.log(tx);
    // const fullTx = await wallet.populateTransaction(tx);
    // console.log(fullTx);
    return tx;
  };

  const sendToken = async () => {
    const txFrom = await contract.transferFrom(newAddr, sendAddr, tokenBal);
    console.log(txFrom);
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
