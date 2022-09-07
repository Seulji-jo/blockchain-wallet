import React from 'react';

function Modal({ children }) {
  return (
    <div>
      <div className="dim"></div>
      <div>
        <button>x</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
