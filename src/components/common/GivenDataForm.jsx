import React from 'react';
function GivenDataForm({ label, value, symbol }) {
  return (
    <div className="wallet-data__wrapper">
      <span className="wallet--label">{label}:</span>
      <div className="wallet--value">
        {value}
        {symbol && <span> {symbol}</span>}
      </div>
    </div>
  );
}

export default GivenDataForm;
