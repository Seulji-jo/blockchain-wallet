import { utils } from 'ethers';
import { useEffect } from 'react';
import { useCallback, useState } from 'react';

function useBalance(provOrContr = {}) {
  const [balance, setBalance] = useState('');
  const [symbol, setSymbol] = useState('');

  const getBalance = useCallback(
    async address => {
      const provider = provOrContr;
      const bigNumBalance = await provider.getBalance(address);
      const balance = utils.formatUnits(bigNumBalance);
      setBalance(balance);
    },
    [provOrContr]
  );

  const getToken = useCallback(
    async address => {
      const contract = provOrContr;
      const tokenBalance = await contract.balanceOf(address);
      setBalance(utils.formatUnits(tokenBalance));
    },
    [provOrContr]
  );

  useEffect(() => {
    async function changeSymbol() {
      if (provOrContr) {
        if ('symbol' in provOrContr) setSymbol(await provOrContr?.symbol());
        else setSymbol('ETH');
      }
    }
    changeSymbol();
  }, [provOrContr]);

  return { balance, getBalance, getToken, symbol };
}

export default useBalance;
