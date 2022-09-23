import React from 'react';

import GivenDataForm from './common/GivenDataForm';
import InputForm from './common/InputForm';

function TransactionList({ log = [], isErc20 = true }) {
  return (
    <li className="list__log">
      <GivenDataForm label={'method'} value={log.name} />
      <GivenDataForm label={'from Address'} value={log.args[0]} />
      <GivenDataForm label={'to Address'} value={log.args[1]} />
      {log.args[2] && <GivenDataForm label={isErc20 ? 'value' : 'tokenId'} value={log.args[2]} />}
    </li>
  );
}

export default TransactionList;
