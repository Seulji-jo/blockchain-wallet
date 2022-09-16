import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';
import useAddressInput from '../hooks/useAddressInput';
import useCoinInput from '../hooks/useCoinInput';

import InputForm from './common/InputForm';

function SendNft() {
  const {
    recipient: fromAddr,
    handleRecipient: handleFromAddr,
    resetRecipient: resetFromAddr,
  } = useAddressInput();
  const {
    recipient: toAddr,
    handleRecipient: handleToAddr,
    resetRecipient: resetToAddr,
  } = useAddressInput();
  const {
    coinVal: tokenId,
    handleCoinVal: handleTokenId,
    resetCoinVal: resetTokenId,
  } = useCoinInput();

  const getSigner = () => {
    const pKey = '0x15b3eed746443d676410608e93459026a560672cd2032a719cfa2137caa06a80';
    const wallet = new ethers.Wallet(pKey);
    const provider = new ethers.providers.InfuraProvider('ropsten');
    return wallet.connect(provider);
  };

  const handleTransferNft = async () => {
    console.log('handleTransferNft');
    const contractAddr = '0x7528D0211c5926EbFddFE9FBCafFDdC8F6adC5f8';
    const providerSigner = getSigner();
    const contract = new ethers.Contract(contractAddr, HannahNftAbi, providerSigner);
    // const uri = `ipfs://${tokenUri}`;
    // ipfs를 붙여 민팅을 하게 되면 메타마스크에서 이미지가 나타나지 않는다.
    const transferringNft = await contract['safeTransferFrom(address,address,uint256)'](
      fromAddr,
      toAddr,
      tokenId
    );
    console.log(transferringNft);
    if (transferringNft) alert('NFT 전송 성공');
  };

  return (
    <div>
      <div className="row">
        <div className="container__wallet">
          <h4 className="title">Send NFT</h4>
          <InputForm label={'From'} onChange={handleFromAddr} />
          <InputForm label={'To'} onChange={handleToAddr} />
          <InputForm label={'Token Id'} onChange={handleTokenId} />
          <button onClick={handleTransferNft} disabled={!fromAddr || !toAddr || !tokenId}>
            send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendNft;
