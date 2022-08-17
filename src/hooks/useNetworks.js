import { useCallback, useState } from 'react';

function useNetworks(initialState = { id: 3, network: 'ropsten', name: 'ropsten' }) {
  const [network, setNetwork] = useState(initialState);

  const networkList = [
    { id: 1, network: 'homestead', name: 'classic' },
    { id: 2, network: 'Morden', name: 'Morden' },
    { id: 3, network: 'ropsten', name: 'ropsten' },
    { id: 4, network: 'rinkeby', name: 'rinkeby' },
    { id: 5, network: 'goerli', name: 'goerli' },
    { id: 42, network: 'Kovan', name: 'Kovan' },
  ];

  const handleNetwork = useCallback(e => {
    console.log(e.target.value);
    const choosingNetwork = networkList.filter(network => e.target.value === network.network);
    console.log(choosingNetwork);
    setNetwork(choosingNetwork[0]);
  }, []);

  return { network, setNetwork, networkList, handleNetwork };
}

export default useNetworks;
