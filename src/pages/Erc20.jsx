import React, { useState } from 'react';

import MetaMaskErc20 from '../components/MetaMaskErc20';
import NewPKeyErc20 from '../components/NewPKeyErc20';
function Erc20() {
  const [metaMaskAddr, setMetaMaskAddr] = useState('');
  const [newAddr, setNewAddr] = useState('');

  return (
    <div className="column">
      <h2>HannahFirstToken (HFT)</h2>
      <ul>
        <li>Contract Address: 0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0</li>
        <li>Network: Ropsten</li>
        <li>
          <a
            href="https://ropsten.etherscan.io/address/0xA66D992f5689D12BF41EC3a6b18445a87AfB9Fd0"
            target="_blank"
            rel="noreferrer">
            Etherscan에서 확인하기
          </a>
        </li>
      </ul>
      <div className="row">
        <MetaMaskErc20
          sendAddr={newAddr}
          metaMaskAddr={metaMaskAddr}
          setMetaMaskAddr={setMetaMaskAddr}
        />
        <NewPKeyErc20 sendAddr={metaMaskAddr} newAddr={newAddr} setNewAddr={setNewAddr} />
      </div>
    </div>
  );
}

export default Erc20;
