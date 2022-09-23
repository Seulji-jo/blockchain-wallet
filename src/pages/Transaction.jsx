import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import useNetworks from '../hooks/useNetworks';
import HannahNftAbi from '../contracts/HannahNftAbi.json';
import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';

import useInput from '../hooks/useInput';

import InputForm from '../components/common/InputForm';
import TransactionList from '../components/TransactionList';

function Transaction() {
  const [provider, setProvider] = useState('');
  const [logList, setLogList] = useState([]);
  const [logDetailList, setLogDetailList] = useState([]);
  const [isErc20, setIsErc20] = useState(true);

  const { network, networkList, handleNetwork } = useNetworks();
  const { input, handleInput, changeInput } = useInput();

  const getTxList = async () => {
    const filter = {
      address: input.address,
      fromBlock: 0,
      toBlock: 'latest',
    };

    const logs = await provider.getLogs(filter);

    setLogList(logs);
  };

  useEffect(() => {
    changeInput('address', process.env.REACT_APP_ERC20_CONTRACT);
  }, [changeInput]);

  useEffect(() => {
    const etherProvider = new ethers.providers.EtherscanProvider(network.network);
    setProvider(etherProvider);
  }, [network]);

  useEffect(() => {
    let iface;
    // 임의로 설정한 방법
    if (logList[0]?.data === '0x') {
      iface = new ethers.utils.Interface(HannahNftAbi);
    } else {
      iface = new ethers.utils.Interface(HannahFirstTokenAbi);
    }
    const parsedEvents = logList.map(log => iface.parseLog(log));

    const changeLogs = parsedEvents.map(log => {
      const { name: eventName, inputs } = log.eventFragment;
      const [from, to, data] = log.args;

      let args = [from, to];
      let newLog = {};

      if (eventName === 'Transfer' && inputs[2].name === 'tokenId') {
        const numVal = data.toNumber();
        args = [...args, numVal];
        setIsErc20(false);
      } else if (eventName === 'Transfer' && inputs[2].name === 'value') {
        const etherVal = ethers.utils.formatEther(data);
        args = [...args, etherVal];
        setIsErc20(true);
      }
      newLog = { ...log, args };
      return newLog;
    });

    setLogDetailList(changeLogs);
  }, [logList]);

  return (
    <div className="row">
      <section className="container__wallet wide column gap10">
        <h4 className="title">CA Tx List</h4>
        <InputForm name={'address'} value={input.address} onChange={handleInput}>
          <select
            name="networks"
            id="networks"
            value={network?.network}
            onChange={e => handleNetwork(e?.target?.value)}>
            {networkList.map(network => (
              <option key={network.id} value={network.network}>
                {network.name}
              </option>
            ))}
          </select>
          <button onClick={getTxList}>Search</button>
        </InputForm>
      </section>
      <section className="container__wallet wide height500">
        <ul className="container__log">
          {logDetailList
            .map((log, i) => <TransactionList key={log.topic + i} log={log} isErc20={isErc20} />)
            .reverse()}
        </ul>
      </section>
    </div>
  );
}

export default Transaction;
