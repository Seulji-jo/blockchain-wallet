import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { randomBytes } from 'ethers/lib/utils';
import { Buffer } from 'buffer';
// import { randomBytes } from 'crypto';
// import createPrivateKey from './utils';
import './App.css';
import axios from 'axios';

import MetaMaskPart from './components/MetaMaskPart';
import NewPKeyPart from './components/NewPKeyPart';

function App() {
  const [errMsg, setErrMsg] = useState('');
  const [metaMaskAddr, setMetaMaskAddr] = useState('');
  const [newAccount, setNewAccount] = useState({});
  const [newAddr, setNewAddr] = useState('');
  const [provider, setProvider] = useState(null);
  const [metaMaskTxVal, setMetaMaskTxVal] = useState('');
  const [newPcoinVal, setNewPcoinVal] = useState('');
  const [network, setNetwork] = useState('');

  const { ethereum } = window;

  const networkList = [
    { id: 1, network: 'homestead', name: 'classic' },
    { id: 2, network: 'Morden', name: 'Morden' },
    { id: 3, network: 'ropsten', name: 'ropsten' },
    { id: 4, network: 'rinkeby', name: 'rinkeby' },
    { id: 5, network: 'goerli', name: 'goerli' },
    { id: 42, network: 'Kovan', name: 'Kovan' },
  ];

  useEffect(() => {
    setProvider(new ethers.providers.InfuraProvider('ropsten'));
  }, []);

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const res = await provider.send('eth_requestAccounts', []);
        const provider = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setMetaMaskAddr(provider[0]);
      } catch (err) {
        setErrMsg(err.massage);
      }
    } else {
      setErrMsg('Install MetaMask');
    }
  };

  const sendTxFromMetamask = async () => {
    const transactionParameters = {
      nonce: '0x00', // ignored by MetaMask
      gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
      gas: '0x2710', // customizable by user during MetaMask confirmation.
      to: newAddr, // Required except during contract publications.
      from: ethereum.selectedAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
      chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    console.log(txHash);
  };

  const createTx = () => {
    let walletSigner = newAccount.connect(provider);
    console.log(`walletSigner=================================`);
    console.log(walletSigner);
    provider.getGasPrice().then(currGasPrice => {
      const gas_price = ethers.utils.hexlify(parseInt(currGasPrice));
      console.log(`gas_price: ${gas_price}`);
      const tx = {
        from: newAddr,
        to: metaMaskAddr,
        value: ethers.utils.parseEther(newPcoinVal),
        nonce: window.ethersProvider.getTransactionCount(newAddr, 'latest'),
        gasLimit: ethers.utils.hexlify(currGasPrice), // 100000
        gasPrice: gas_price,
      };
      console.dir(tx);
      try {
        walletSigner.sendTransaction(tx).then(transaction => {
          console.dir(transaction);
          alert('Send finished!');
        });
      } catch (error) {
        alert('failed to send!!');
      }
    });
  };

  const createTxEtherscanWay = async () => {
    const transaction = {
      to: metaMaskAddr,
      value: ethers.utils.parseEther(newPcoinVal),
      gasLimit: '21000',
      maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
      nonce: 1,
      type: 2,
      chainId: 3,
    };
    // sign and serialize the transaction
    let rawTransaction = await newAccount
      .signTransaction(transaction)
      .then(ethers.utils.serializeTransaction(transaction));
    console.log('Raw txhash string ' + rawTransaction);

    // pass the raw transaction hash to the "eth_sendRawTransaction" endpoint
    let gethProxy = await fetch(
      `https://api-ropsten.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${rawTransaction}&apikey=YourApiKeyToken`
    );
    console.log(gethProxy);
    let response = await gethProxy.json();

    const res = await axios.get(
      `https://api-ropsten.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${rawTransaction}&apikey=YourApiKeyToken`
    );

    // print the API response
    console.log(response);
    console.log(res);
  };

  const handleTestnet = async () => {
    const rpcAddr = 'https://ropsten.infura.io/v3/5ac081c4be5a471ea67bb469697bc198';
    const defaultProvider = new ethers.getDefaultProvider(rpcAddr);
    console.log(defaultProvider);
    const infuraProvider = new ethers.providers.InfuraProvider('ropsten');
    console.log(infuraProvider);
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcAddr);
    console.log(jsonRpcProvider);
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    console.log(provider);

    defaultProvider.on('network', async (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      console.log(newNetwork);
      console.log(oldNetwork);
      oldNetwork = newNetwork;
      newNetwork = ethers.providers.getNetwork('goerli');
      if (oldNetwork) {
        // window.location.reload();
        const balance = await defaultProvider.getBalance(metaMaskAddr);
        console.log(ethers.utils.formatEther(balance));
        console.log(newNetwork);
        console.log(oldNetwork);
      }
    });
    console.log(defaultProvider);
    provider.on('network', (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      oldNetwork = newNetwork;
      newNetwork = ethers.providers.getNetwork('goerli');
      console.log(newNetwork);
      console.log(oldNetwork);
      // if (oldNetwork) {
      //   window.location.reload();
      // }
    });
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <main className="App-main">
        <div className="row">
          {/* <MetaMaskPart /> */}
          <NewPKeyPart />
        </div>
      </main>
    </div>
  );
}

export default App;
