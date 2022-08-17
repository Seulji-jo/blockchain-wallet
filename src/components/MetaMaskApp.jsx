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
        console.log(resSwitchChain);
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
        const tokenBalance = await contract.balanceOf(providerAcct[0]);

        setProvider(provider);
        setMetaMaskAddr(providerAcct[0]);
        setSigner(signer);
        setBalance(balance);
        setContract(contract);
        setTokenBalace(ethers.utils.formatUnits(tokenBalance));
        setSymbol(await contract.symbol());
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

  const sendTransaction = async (recipient, msg) => {
    if (!recipient) {
      alert(msg);
    } else if (!coinVal) {
      alert('Value를 입력해주세요');
    } else {
      const tx = await createTx(recipient);
      try {
        const sendTx = await signer.sendTransaction(tx);
        console.dir(sendTx);
        alert('Send finished!');
        resetCoinVal();
        resetRecipient();
      } catch (error) {
        console.log(error);
        alert('failed to send!!');
      }
    }
  };

  const sendToken = async () => {
    console.log(tokenBal);
    const tx = await contract.transfer(sendAddr, parseUnits(tokenBal));
    console.log(tx);
  };

  return (
    <div className="container__wallet">
      <button onClick={connetingMetaMask} disabled={metaMaskAddr}>
        Meta Mask 연결
      </button>
      <div>MetaMask Address: {metaMaskAddr}</div>
      <div>Balance: {balance}</div>
      <div>
        <label htmlFor="coinVal">Value: </label>
        <input type="text" name="coinVal" value={coinVal} onChange={handleCoinVal} />
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
        send To New Private Key
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
      </div>
    </div>
  );
}

export default MetaMaskApp;
