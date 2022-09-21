import { providers, utils } from 'ethers';
import React, { useEffect, useState } from 'react';
import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

import useNetworks from '../hooks/useNetworks';
import useBalance from '../hooks/useBalance';
import useInput from '../hooks/useInput';

function MetaMaskApp({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  const { ethereum } = window;
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const { network, networkList, handleNetwork, switchMetaMaskChain } = useNetworks();
  const { input, handleInput, changeInput, resetInput } = useInput();
  const { balance, getBalance } = useBalance(provider);

  const handleAccountsChanged = async accounts => {
    try {
      setMetaMaskAddr(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChainChanged = async chainId => {
    try {
      const network = networkList.filter(li => li.id === parseInt(chainId, 16));
      handleNetwork(network[0].network);
    } catch (error) {
      console.log(error);
    }
  };

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        const provider = new providers.Web3Provider(ethereum, 'any');
        const signer = provider.getSigner();
        const providerAcct = await provider.send('eth_requestAccounts');
        const addr = await signer.getAddress();
        const currChain = await ethereum.request({ method: 'eth_chainId' });
        const network = networkList.filter(li => li.id === parseInt(currChain, 16));

        setProvider(provider);
        setMetaMaskAddr(providerAcct[0]);
        setSigner(signer);
        handleNetwork(network[0].network);
      } catch (err) {
        alert(err.massage);
      }
    } else {
      alert('Install MetaMask');
    }
  };

  const getPkeyAddr = () => {
    if (!sendAddr) alert('개인키를 생성해주세요!');
    else changeInput('to', sendAddr);
  };

  const createTx = async () => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = utils.hexlify(parseInt(currGasPrice));
    const value = utils.parseEther(input.value);
    const tx = { to: input.to, value };
    return tx;
  };

  const sendTransaction = async () => {
    if (!input.value) {
      alert('Value를 입력해주세요');
    } else {
      const tx = await createTx();
      try {
        const sendTx = await signer.sendTransaction(tx);
        const resTx = await provider.waitForTransaction(sendTx.hash);
        if (resTx) {
          setIsClickedBtn(true);
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
    const chageProvider = async () => {
      if (metaMaskAddr) {
        const isChangedChain = await switchMetaMaskChain();
        if (isChangedChain) {
          const provider = new providers.Web3Provider(ethereum, 'any');
          setProvider(provider);
        }
      }
    };
    chageProvider();
  }, [ethereum, metaMaskAddr, network, switchMetaMaskChain]);

  useEffect(() => {
    if (provider || isClickedBtn) {
      getBalance(metaMaskAddr);
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, provider, getBalance, metaMaskAddr]);

  useEffect(() => {
    if (ethereum) {
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  });

  return (
    <section className="container__wallet">
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <GivenDataForm label={'MetaMask Address'} value={metaMaskAddr} />
      <GivenDataForm label={'Balance'} value={balance} />
      <InputForm label={'To'} name={'to'} value={input.to} onChange={handleInput}>
        <button onClick={getPkeyAddr}>PKey Addr</button>
      </InputForm>
      <InputForm label={'Value'} name={'value'} value={input.value} onChange={handleInput}>
        <select
          name="networks"
          // id="networks"
          value={network?.network}
          onChange={e => handleNetwork(e?.target?.value)}>
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

export default MetaMaskApp;
