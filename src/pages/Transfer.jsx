import React, { useState } from 'react';
import MetaMaskApp from '../components/MetaMaskApp';
import NewPKey from '../components/NewPKey';

function Transfer() {
  const [metaMaskAddr, setMetaMaskAddr] = useState('');
  const [newAddr, setNewAddr] = useState('');

  return (
    <div className="row">
      <MetaMaskApp
        sendAddr={newAddr}
        metaMaskAddr={metaMaskAddr}
        setMetaMaskAddr={setMetaMaskAddr}
      />
      <NewPKey sendAddr={metaMaskAddr} newAddr={newAddr} setNewAddr={setNewAddr} />
    </div>
  );
}

export default Transfer;
