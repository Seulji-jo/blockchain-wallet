import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import useAddressInput from '../hooks/useAddressInput';

function MetaMaskExtension({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  const { ethereum } = window;
  const { networkList } = useNetworks();
  const { coinVal, handleCoinVal, resetCoinVal } = useCoinInput();
  const { recipient, handleRecipient, resetRecipient } = useAddressInput();
  const [errMsg, setErrMsg] = useState('');
  const [chainName, setChainName] = useState('');
  // const [balance, setBalance] = useState('');

  const handleChainChanged = chainId => {
    const changedChain = networkList.filter(li => li.id === parseInt(chainId, 16));
    setChainName(changedChain[0].name);
  };

  const handleAccountsChanged = async accounts => {
    try {
      setMetaMaskAddr(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        const provider = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        setMetaMaskAddr(provider[0]);
        handleChainChanged(chainId);
      } catch (err) {
        setErrMsg(err.massage);
      }
    } else {
      setErrMsg('Install MetaMask');
    }
  };

  const sendTxFromMetamask = async (recipient, msg) => {
    if (!recipient) {
      alert(msg);
    } else if (!coinVal) {
      alert('Value를 입력해주세요');
    } else {
      const gasPrice = await ethereum.request({ method: 'eth_gasPrice' });
      const weiVal = ethers.utils.parseUnits(coinVal);

      const txParams = {
        from: metaMaskAddr,
        to: recipient,
        // value: ethers.utils.hexlify(weiVal),
        // gasPrice: gasPrice,
      };

      try {
        const sendTx = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        alert(`트랜잭션 전송 완료: ${sendTx}`);
        resetCoinVal();
        resetRecipient();
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (metaMaskAddr) {
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // const blockNum = await ethereum.request({
    //   method: 'eth_blockNumber',
    // });
    // console.log(blockNum);
    // const balance = await ethereum.request({
    //   method: 'eth_getBalance',
    //   params: [metaMaskAddr, 'latest'],
    // });
    // const weiBalance = ethers.BigNumber.from(balance).toString();
    // const etherBalance = ethers.utils.formatUnits(weiBalance);
    // setBalance(etherBalance);

    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [ethereum, metaMaskAddr]);

  return (
    <div className="container__wallet">
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <div>MetaMask Address: {metaMaskAddr}</div>
      <div>
        <div>{chainName}</div>
        <label htmlFor="coinVal">Value: </label>
        <input type="text" name="coinVal" value={coinVal} onChange={handleCoinVal} />
      </div>
      <div>
        <label htmlFor="coinVal">To: </label>
        <input type="text" name="coinVal" value={recipient} onChange={handleRecipient} />
        <button onClick={() => sendTxFromMetamask(recipient, '주소를 입력해주세요!')}>
          send To Address
        </button>
      </div>
      <button onClick={() => sendTxFromMetamask(sendAddr, 'private key를 생성해주세요')}>
        send To New Private Key
      </button>
    </div>
  );
}

export default MetaMaskExtension;
