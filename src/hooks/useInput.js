import { useCallback } from 'react';
import { useState } from 'react';

function useInput(initialState = {}) {
  const [input, setInput] = useState(initialState);

  const handleInput = useCallback(e => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  }, []);

  const changeInput = useCallback((key, val) => {
    setInput(prev => ({ ...prev, [key]: val }));
  }, []);

  const resetInput = useCallback(() => setInput(initialState), [initialState]);

  return { input, handleInput, changeInput, resetInput };
}

export default useInput;
