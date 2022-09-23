import React from 'react';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';
import useInput from '../hooks/useInput';

import InputForm from './common/InputForm';

function SendNft() {
  const { input, handleInput, resetInput } = useInput();

  const getSigner = () => {
    const pKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new ethers.Wallet(pKey);
    const provider = new ethers.providers.InfuraProvider('ropsten');
    return wallet.connect(provider);
  };

  const handleTransferNft = async () => {
    const contractAddr = process.env.REACT_APP_ERC721_CONTRACT;
    const providerSigner = getSigner();
    const contract = new ethers.Contract(contractAddr, HannahNftAbi, providerSigner);

    const { from, to, tokenId } = input;

    const transferringNft = await contract['safeTransferFrom(address,address,uint256)'](
      from,
      to,
      tokenId
    );

    if (transferringNft) {
      resetInput();
      alert('NFT 전송 성공');
    }
  };

  return (
    <section className="container__wallet">
      <h4 className="title">Send NFT</h4>
      <InputForm label={'From'} name={'from'} value={input.from} onChange={handleInput} />
      <InputForm label={'To'} name={'to'} value={input.to} onChange={handleInput} />
      <InputForm label={'Token Id'} name={'tokenId'} value={input.tokenId} onChange={handleInput} />
      <button onClick={handleTransferNft} disabled={!input.from || !input.to || !input.tokenId}>
        send
      </button>
    </section>
  );
}

export default SendNft;
