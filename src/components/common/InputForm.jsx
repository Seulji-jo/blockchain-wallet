import React, { useState } from 'react';

function InputForm({ label, onChange, children }) {
  const [inputVal, setInputVal] = useState('');

  const handleInputVal = e => {
    setInputVal(e.target.value);
    onChange && onChange(e);
  };

  return (
    <div className="wallet-data__wrapper">
      <label className="wallet--label" htmlFor="coinVal">
        {label}:
      </label>
      <div className="input__row">
        <input type="text" name="coinVal" value={inputVal} onChange={handleInputVal} />
        {children}
      </div>
    </div>
  );
}

export default InputForm;
