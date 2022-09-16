import { BigNumber, ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAddressInput from '../hooks/useAddressInput';
import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';
import { parseUnits } from 'ethers/lib/utils';

function MetaMaskApp({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  const { ethereum } = window;
  const { network, networkList, handleNetwork } = useNetworks();
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
  const [tokenBalance, setTokenBalace] = useState('');
  const [contract, setContract] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const checkChainId = hexChainId => {
    // 0x3으로 보내야하는데 체인아이디를 hexString으로 바꾸면 0x03으로나와 거치는 단계
    const regex = /^0x0/g;
    return hexChainId.replace(regex, '0x');
  };

  useEffect(() => {
    async function switchChainId() {
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
    if (metaMaskAddr) switchChainId();
  }, [network]);

  useEffect(() => {
    if (metaMaskAddr || isClickedBtn) {
      getTokenBalance();
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, metaMaskAddr]);

  const getTokenBalance = async () => {
    const tokenBalance = await contract.balanceOf(metaMaskAddr);
    setTokenBalace(ethers.utils.formatUnits(tokenBalance));
    setSymbol(await contract.symbol());
  };

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const providerAcct = await provider.send('eth_requestAccounts');

        const bigNumBalance = await provider.getBalance(providerAcct[0]);
        const balance = ethers.utils.formatUnits(bigNumBalance);

        const contractAddr = '0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0';
        const contract = new ethers.Contract(contractAddr, HannahFirstTokenAbi, signer);

        setProvider(provider);
        setMetaMaskAddr(providerAcct[0]);
        setSigner(signer);
        setBalance(balance);
        setContract(contract);
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

  const sendToken = async () => {
    // 따로 트랜젝션 생성하지 않고, Transfer함수를 사용한다.
    // transfer 함수 내에서 transaction을 만들어 보내주는 기능을 하는듯.
    const tx = await contract.transfer(sendAddr, parseUnits(tokenBal));
    const resTx = await provider.waitForTransaction(tx.hash);
    if (resTx) {
      setIsClickedBtn(true);
      resetCoinVal();
      resetTokenBal();
      resetRecipient();
      alert('Send finished!');
    }
  };

  return (
    <div className="container__wallet">
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <div className="wallet-data__wrapper">
        <label>MetaMask Address:</label>
        <div className="wallet--value">{metaMaskAddr}</div>
      </div>
      <div className="wallet-data__wrapper">
        <label>Balance:</label>
        <div className="wallet--value">{balance}</div>
      </div>
      <div className="wallet-data__wrapper">
        <label className="token">Token</label>
        <div className="wallet--value">
          {tokenBalance}
          <span> {symbol}</span>
        </div>
      </div>
      <div className="wallet-data__wrapper">
        <label htmlFor="coinVal">To: </label>
        <div className="input__row">
          <input type="text" name="coinVal" value={recipient} onChange={handleRecipient} />
          <button onClick={getPkeyAddr}>PKey Addr</button>
        </div>
      </div>
      <div className="wallet-data__wrapper">
        <label htmlFor="tokenBal">Value: </label>
        <input type="text" name="tokenBal" value={tokenBal} onChange={handleTokenBal} />
      </div>
      <button onClick={sendToken}>Send</button>
    </div>
  );
}

export default MetaMaskApp;
