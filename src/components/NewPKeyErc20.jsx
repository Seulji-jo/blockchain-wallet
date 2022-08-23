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
    console.log(tokenBalance);

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

  const sendTransaction = async (recipient, msg) => {
    console.log('send');
    if (!recipient) {
      alert(msg);
    } else if (!coinVal) {
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
      console.log('sendTx↴ ');
      console.log(sendTx);
    }
  };

  const sendToken = async () => {
    console.log(tokenBal);
    console.log(sendAddr);
    console.log(contract);
    // const tx = await contract.transfer(sendAddr, parseUnits(tokenBal));
    // console.log(tx);
    const txFrom = await contract.transferFrom(newAddr, sendAddr, tokenBal);
    console.log(txFrom);
  };

  const handleTxList = async () => {
    // 방법1
    const code = await provider.getCode('0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0');
    // console.log(code);
    const filter = {
      address: '0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0',
      fromBlock: 0,
      toBlock: 'latest',
    };
    const infuraLogs = await provider.getLogs(filter);
    console.log(infuraLogs); // []

    // 방법2
    let abi = ['event Transfer(address indexed from, address indexed to, uint value)'];
    // let abi = ['event Transfer(address indexed from, address to, uint256 indexed value)'];
    let iface = new ethers.utils.Interface(abi);
    console.log(iface);
    const parsedEvents = infuraLogs.map(log => iface.parseLog(log));
    console.log(parsedEvents);
  };

  return (
    <div className="container__wallet">
      <button onClick={createPrivateKey} disabled={wallet?.privateKey}>
        New Private Key 생성
      </button>
      <div>New Private Key: {wallet?.privateKey}</div>
      <div>New Address: {wallet?.address}</div>
      <div>
        <label htmlFor="coinVal">Value: </label>
        <input type="text" name="coinVal" onChange={handleCoinVal} value={coinVal} />
        <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
          {networkList.map(network => (
            <option key={network.id} value={network.network}>
              {network.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="coinVal">To: </label>
        <input type="text" name="coinVal" value={recipient} onChange={handleRecipient} />
        <button onClick={() => sendTransaction(recipient, '주소를 입력해주세요!')}>
          send To Address
        </button>
      </div>
      <button onClick={() => sendTransaction(sendAddr, 'private key를 생성해주세요')}>
        send to Metamask
      </button>
      <div>
        <div className="token">Token</div>
        <div>
          {tokenBalance}
          <span> {symbol}</span>
        </div>
        <label htmlFor="tokenBal">Value: </label>
        <input type="text" name="tokenBal" value={tokenBal} onChange={handleTokenBal} />
        <button onClick={sendToken}>send token</button>
        <button onClick={handleTxList}>showTxList</button>
      </div>
    </div>
  );
}

export default NewPKeyPart;
