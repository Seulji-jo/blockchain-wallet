import { BigNumber, ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import useAddressInput from '../hooks/useAddressInput';
import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

function MetaMaskApp({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  const { ethereum } = window;
  const { network, setNetwork, networkList, handleNetwork } = useNetworks();
  const { coinVal, handleCoinVal, resetCoinVal } = useCoinInput();
  const {
    coinVal: tokenBal,
    handleCoinVal: handleTokenBal,
    resetCoinVal: resetTokenBal,
  } = useCoinInput();
  const { recipient, handleRecipient, resetRecipient } = useAddressInput();
  const [errMsg, setErrMsg] = useState('');
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('');
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const checkChainId = hexChainId => {
    // 0x3으로 보내야하는데 체인아이디를 hexString으로 바꾸면 0x03으로나와 거치는 단계
    const regex = /^0x0/g;
    return hexChainId.replace(regex, '0x');
  };

  useEffect(() => {
    async function switchChainId() {
      if (metaMaskAddr) {
        const hexChainID = ethers.utils.hexlify(network.id);
        try {
          const resSwitchChain = await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: checkChainId(hexChainID) }],
          });
          if (provider) {
            const bigNumBalance = await provider.getBalance(metaMaskAddr);
            const balance = ethers.utils.formatUnits(bigNumBalance);
            setBalance(balance);
          }
        } catch (error) {
          if (error.code === 4902) {
            console.error('This network is not found in your network!');
            // 다른 이유로 네트워크를 변경하지 못했을 때 처리
          } else {
            console.error(error);
          }
        }
      }
    }
    if (metaMaskAddr) switchChainId();
  }, [network]);

  useEffect(() => {
    if (provider || isClickedBtn) {
      getBalance();
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, provider]);

  const getBalance = async () => {
    const providerAcct = await provider.send('eth_requestAccounts');
    const bigNumBalance = await provider.getBalance(providerAcct[0]);
    const balance = ethers.utils.formatUnits(bigNumBalance);
    setBalance(balance);
  };

  const handleAccountsChanged = async accounts => {
    try {
      setMetaMaskAddr(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (metaMaskAddr) {
      // ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      // ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [ethereum]);

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum, 'any');
        const signer = provider.getSigner();
        const providerAcct = await provider.send('eth_requestAccounts');
        const currChain = await ethereum.request({ method: 'eth_chainId' });
        const network = networkList.filter(li => li.id === parseInt(currChain, 16));

        setProvider(provider);
        setMetaMaskAddr(providerAcct[0]);
        setSigner(signer);
        setNetwork(network[0]);
      } catch (err) {
        setErrMsg(err.massage);
      }
    } else {
      setErrMsg('Install MetaMask');
    }
  };

  const createTx = async recipient => {
    const currGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt(currGasPrice));
    const value = ethers.utils.parseEther(coinVal);
    const tx = { to: recipient, value };
    return tx;
  };

  const getPkeyAddr = () => {
    if (!sendAddr) alert('개인키를 생성해주세요!');
    else handleRecipient(sendAddr);
  };

  const sendTransaction = async () => {
    if (!coinVal) {
      alert('Value를 입력해주세요');
    } else {
      const tx = await createTx(recipient);
      try {
        const sendTx = await signer.sendTransaction(tx);
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
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <GivenDataForm label={'MetaMask Address'} value={metaMaskAddr} />
      <GivenDataForm label={'Balance'} value={balance} />
      <InputForm label={'To'} onChange={handleRecipient}>
        <button onClick={getPkeyAddr}>PKey Addr</button>
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

export default MetaMaskApp;
