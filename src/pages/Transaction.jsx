import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import useNetworks from '../hooks/useNetworks';
import HannahNftAbi from '../contracts/HannahNftAbi.json';

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
    if (logList[0]?.data === '0x') {
      iface = new ethers.utils.Interface(HannahNftAbi);
    } else {
      let abi = ['event Transfer(address indexed from, address indexed to, uint value)'];
      iface = new ethers.utils.Interface(abi);
    }
    const parsedEvents = logList.map(log => iface.parseLog(log));
    console.log(parsedEvents);
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
    setLogList(logs);
    console.log(logs);
  };

  return (
    <div className="row">
      <div>
        <div>CA Tx List</div>
        <input value={contractAddr} onChange={e => setContractAddr(e.target.value)} />
        <select name="networks" id="networks" value={network.network} onChange={handleNetwork}>
          {networkList.map(network => (
            <option key={network.id} value={network.network}>
              {network.name}
            </option>
          ))}
        </select>
        <button onClick={getTxList}>Search</button>
      </div>
      <div>
        <ul>
          {logDetailList
            .map((log, i) => (
              <li key={log.topic + i}>
                <div>method: {log.name}</div>
                <div>from Address: {log.args[0]}</div>
                <div>to Address: {log.args[1]}</div>
                {log.args[2] && (
                  <div>
                    {isErc20 ? 'value' : 'tokenId'}: {log.args[2]}
                  </div>
                )}
                {/* <div>tokenId: {log.args[2].toNumber()}</div> */}
              </li>
            ))
            .reverse()}
        </ul>
      </div>
    </div>
  );
}

export default Transaction;
