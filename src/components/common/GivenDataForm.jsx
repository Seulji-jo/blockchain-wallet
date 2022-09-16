import React from 'react';
function GivenDataForm({ label, value }) {
  return (
    <div className="wallet-data__wrapper">
      <span className="wallet--label">{label}:</span>
      <div className="wallet--value">{value}</div>
    </div>
  );
}

export default GivenDataForm;
