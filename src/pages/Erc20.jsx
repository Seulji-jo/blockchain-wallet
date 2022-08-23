import React, { useState } from 'react';

import MetaMaskErc20 from '../components/MetaMaskErc20';
import NewPKeyErc20 from '../components/NewPKeyErc20';
function Erc20() {
  const [metaMaskAddr, setMetaMaskAddr] = useState('');
  const [newAddr, setNewAddr] = useState('');

  return (
    <div className="row">
      <MetaMaskErc20
        sendAddr={newAddr}
        metaMaskAddr={metaMaskAddr}
        setMetaMaskAddr={setMetaMaskAddr}
      />
      <NewPKeyErc20 sendAddr={metaMaskAddr} newAddr={newAddr} setNewAddr={setNewAddr} />
    </div>
  );
}

export default Erc20;
