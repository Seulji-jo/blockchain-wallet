import { utils } from 'ethers';
import { useCallback, useState } from 'react';

function useBalance(provider) {
  const [balance, setBalance] = useState('');

  const getBalance = useCallback(
    async address => {
      console.log(address);
      const bigNumBalance = await provider.getBalance(address);
      const balance = utils.formatUnits(bigNumBalance);
      console.log(balance);
      setBalance(balance);
    },
    [provider]
  );

  return { balance, getBalance };
}

export default useBalance;