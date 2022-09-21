import React, { useState } from 'react';

function InputForm({ label = '', name = '', value = '', onChange, children }) {
  const [inputVal, setInputVal] = useState(value);

  const handleInputVal = e => {
    setInputVal(e.target.value);
    onChange && onChange(e);
  };

  return (
    <div className="wallet-data__wrapper">
      {label && (
        <label className="wallet--label" htmlFor="inputVal">
          {label}:
        </label>
      )}
      <div className="input__row">
        <input
          type="text"
          name={name ?? 'inputVal'}
          value={value ?? inputVal}
          onChange={handleInputVal}
        />
        {children}
      </div>
    </div>
  );
}

export default InputForm;
