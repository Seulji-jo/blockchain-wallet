import { useState } from 'react';

function useSubmitBtn() {
  const [isSendComplete, setIsSendComplete] = useState(false);

  useState(() => {}, [isSendComplete]);
}

export default useSubmitBtn;
