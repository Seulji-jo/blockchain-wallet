import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';

import './App.css';
import Transfer from './pages/Transfer';
import Erc20 from './pages/Erc20';
import Erc721 from './pages/Erc721';
import Transaction from './pages/Transaction';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <NavLink to="/">Send</NavLink>
          <NavLink to="/erc-20">ERC-20</NavLink>
          <NavLink to="/erc-721">ERC-721</NavLink>
          <NavLink to="/transaction">TxList</NavLink>
        </nav>
      </header>
      <main className="App-main">
        <Routes>
          {/* <Route path="/" element={<Navigate to="/erc-20" />}></Route> */}
          <Route path="/" element={<Transfer />}></Route>
          <Route path="erc-20" element={<Erc20 />}></Route>
          <Route path="erc-721" element={<Erc721 />}></Route>
          <Route path="transaction" element={<Transaction />}></Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
