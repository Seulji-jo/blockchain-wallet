import { useCallback, useState } from 'react';

function useCoinInput(initialState = '') {
  const [coinVal, setCoinVal] = useState(initialState);

  const handleCoinVal = useCallback(e => {
    setCoinVal(e.target.value);
  }, []);

  const resetCoinVal = useCallback(() => setCoinVal(initialState), [initialState]);

  return { coinVal, handleCoinVal, resetCoinVal };
}

export default useCoinInput;
