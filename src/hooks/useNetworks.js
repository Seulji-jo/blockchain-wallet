import { utils } from 'ethers';
import { useCallback, useState, useEffect } from 'react';

function useNetworks(initialState = { id: 3, network: 'ropsten', name: 'ropsten' }) {
  const { ethereum } = window;
  const [network, setNetwork] = useState(initialState);
  const [isSwitchedChain, setIsSwitchedChain] = useState(false);

  const networkList = [
    { id: 1, network: 'homestead', name: 'classic' },
    { id: 2, network: 'Morden', name: 'Morden' },
    { id: 3, network: 'ropsten', name: 'ropsten' },
    { id: 4, network: 'rinkeby', name: 'rinkeby' },
    { id: 5, network: 'goerli', name: 'goerli' },
    { id: 42, network: 'Kovan', name: 'Kovan' },
  ];

  const handleNetwork = useCallback(chain => {
    const choosingNetwork = networkList.filter(network => chain === network.network);
    setNetwork(choosingNetwork[0]);
  }, []);

  const checkChainId = hexChainId => {
    // 0x3으로 보내야하는데 체인아이디를 hexString으로 바꾸면 0x03으로나와 거치는 단계
    const regex = /^0x0/g;
    return hexChainId.replace(regex, '0x');
  };

  const switchMetaMaskChain = useCallback(async () => {
    const hexChainID = utils.hexlify(network.id);
    console.log('2: switchMetaMaskChain');
    try {
      const resSwitchChain = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: checkChainId(hexChainID) }],
      });
      return !resSwitchChain;
    } catch (error) {
      if (error.code === 4902) {
        console.error('This network is not found in your network!');
        // 다른 이유로 네트워크를 변경하지 못했을 때 처리
      } else {
        console.error(error);
      }
    }
  }, [network]);

  // useEffect(() => {
  //   async function switchChainId() {
  //     if (network) {
  //       const hexChainID = ethers.utils.hexlify(network.id);
  //       try {
  //         const resSwitchChain = await ethereum.request({
  //           method: 'wallet_switchEthereumChain',
  //           params: [{ chainId: checkChainId(hexChainID) }],
  //         });
  //         console.log('2: change MetaMask Chain Id');
  //         if (resSwitchChain === null) setIsSwitchedChain(!resSwitchChain);
  //       } catch (error) {
  //         if (error.code === 4902) {
  //           console.error('This network is not found in your network!');
  //           // 다른 이유로 네트워크를 변경하지 못했을 때 처리
  //         } else {
  //           console.error(error);
  //         }
  //       }
  //     }
  //   }
  //   if (network) switchChainId();
  // }, [network]);

  return { network, networkList, handleNetwork, switchMetaMaskChain };
}

export default useNetworks;
