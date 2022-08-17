import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import useCoinInput from '../hooks/useCoinInput';
import useNetworks from '../hooks/useNetworks';
import MetaMaskExtension from './MetaMaskExtension';
import MetaMaskApp from './MetaMaskApp';

function MetaMaskPart({ sendAddr, metaMaskAddr, setMetaMaskAddr }) {
  return (
    <div className="container__meta">
      <MetaMaskExtension
        sendAddr={sendAddr}
        metaMaskAddr={metaMaskAddr}
        setMetaMaskAddr={setMetaMaskAddr}
      />
      <MetaMaskApp
        sendAddr={sendAddr}
        metaMaskAddr={metaMaskAddr}
        setMetaMaskAddr={setMetaMaskAddr}
      />
    </div>
  );
}

export default MetaMaskPart;
