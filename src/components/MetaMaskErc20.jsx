import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';
import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';

import useBalance from '../hooks/useBalance';
import useInput from '../hooks/useInput';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

function MetaMaskApp({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  const { ethereum } = window;
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isClickedBtn, setIsClickedBtn] = useState(false);

  const { input, handleInput, changeInput, resetInput } = useInput();
  const { balance, getToken, symbol } = useBalance(contract);

  const connetingMetaMask = async () => {
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const providerAcct = await provider.send('eth_requestAccounts');
        const contractAddr = process.env.REACT_APP_ERC20_CONTRACT;
        const contract = new ethers.Contract(contractAddr, HannahFirstTokenAbi, signer);

        setProvider(provider);
        setMetaMaskAddr(providerAcct[0]);
        setContract(contract);
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

  const sendToken = async () => {
    // 따로 트랜젝션 생성하지 않고, Transfer함수를 사용한다.
    // transfer 함수 내에서 transaction을 만들어 보내주는 기능을 하는듯.
    const tx = await contract.transfer(sendAddr, parseUnits(input.tokenVal));
    const resTx = await provider.waitForTransaction(tx.hash);
    if (resTx) {
      setIsClickedBtn(true);
      resetInput();
      alert('Send finished!');
    }
  };

  useEffect(() => {
    if (metaMaskAddr || isClickedBtn) {
      getToken(metaMaskAddr);
    }
    setIsClickedBtn(false);
  }, [isClickedBtn, metaMaskAddr, getToken]);

  return (
    <section className="container__wallet">
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <GivenDataForm label={'MetaMask Address'} value={metaMaskAddr} />
      <GivenDataForm label={'Token'} value={balance} symbol={symbol} />
      <InputForm label={'To'} name={'to'} value={input.to} onChange={handleInput}>
        <button onClick={getPkeyAddr}>PKey Addr</button>
      </InputForm>
      <InputForm label={'Value'} name={'tokenVal'} value={input.tokenVal} onChange={handleInput} />
      <button onClick={sendToken}>Send</button>
    </section>
  );
}

export default MetaMaskApp;
