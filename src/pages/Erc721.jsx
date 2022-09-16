import React from 'react';

import MintNft from '../components/MintNft';
import SendNft from '../components/SendNft';

function Erc721() {
  return (
    <div>
      <div className="row">
        <MintNft />
        <SendNft />
      </div>
    </div>
  );
}

export default Erc721;
