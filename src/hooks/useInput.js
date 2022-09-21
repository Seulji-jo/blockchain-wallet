import { useCallback } from 'react';
import { useState } from 'react';

function useInput(initialState = {}) {
  const [input, setInput] = useState(initialState);

  const handleInput = useCallback(e => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const changeInput = useCallback((key, val) => {
    setInput(prev => ({ ...prev, [key]: val }));
  }, []);

  const resetInput = useCallback(() => setInput(initialState), [initialState]);

  return { input, handleInput, changeInput, resetInput };
}

export default useInput;
