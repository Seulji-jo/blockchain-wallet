import { useCallback, useState } from 'react';

function useAddressInput(initialState = '') {
  const [recipient, setRecipient] = useState('');

  const handleRecipient = useCallback(e => {
    if (typeof e === 'string') setRecipient(e);
    else setRecipient(e.target.value);
  }, []);

  const resetRecipient = useCallback(() => setRecipient(initialState), [initialState]);

  return { recipient, handleRecipient, resetRecipient };
}

export default useAddressInput;
