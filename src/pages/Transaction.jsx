import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import useNetworks from '../hooks/useNetworks';
import HannahNftAbi from '../contracts/HannahNftAbi.json';
import HannahFirstTokenAbi from '../contracts/HannahFirstTokenAbi.json';

import GivenDataForm from '../components/common/GivenDataForm';
import InputForm from '../components/common/InputForm';

function Transaction() {
  const { network, networkList, handleNetwork } = useNetworks();
  const [contractAddr, setContractAddr] = useState('0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0');
  const [provider, setProvider] = useState('');
  const [logList, setLogList] = useState([]);
  const [logDetailList, setLogDetailList] = useState([]);
  const [isErc20, setIsErc20] = useState(true);

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
      // let abi = ['event Transfer(address indexed from, address indexed to, uint value)'];
      iface = new ethers.utils.Interface(HannahFirstTokenAbi);
    }
    const parsedEvents = logList.map(log => iface.parseLog(log));
    const changeLogs = parsedEvents.map(log => {
      const { name: eventName } = log.eventFragment;
      const { inputs } = log.eventFragment;
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
    console.log(changeLogs);
    setLogDetailList(changeLogs);
  }, [logList]);

  const getTxList = async () => {
    const filter = {
      address: contractAddr,
      fromBlock: 0,
      toBlock: 'latest',
    };
    const logs = await provider.getLogs(filter);
    console.log(logs);
    setLogList(logs);
  };

  return (
    <div className="row">
      <section className="container__wallet wide column gap10">
        <h4 className="title">CA Tx List</h4>
        <InputForm value={contractAddr} onChange={e => setContractAddr(e.target.value)}>
          <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
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
            .map((log, i) => (
              <li key={log.topic + i} className="list__log">
                <GivenDataForm label={'method'} value={log.name} />
                <GivenDataForm label={'from Address'} value={log.args[0]} />
                <GivenDataForm label={'to Address'} value={log.args[1]} />
                {log.args[2] && (
                  <GivenDataForm label={isErc20 ? 'value' : 'tokenId'} value={log.args[2]} />
                )}
              </li>
            ))
            .reverse()}
        </ul>
      </section>
    </div>
  );
}

export default Transaction;
