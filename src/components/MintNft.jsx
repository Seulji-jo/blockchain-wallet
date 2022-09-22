import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadImg2Ipfs, sendJson2Ipfs } from '../api/index';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';

import InputForm from './common/InputForm';

import useInput from '../hooks/useInput';

function MintNft() {
  const fileInput = useRef(null);

  const [prevImg, setPrevImg] = useState(null);
  const [tokenUri, setTokenUri] = useState('');
  const [txHash, setTxHash] = useState('');

  const { input, handleInput, changeInput, resetInput } = useInput({});

  const resetForm = () => {
    resetInput();
    URL.revokeObjectURL(prevImg);
    setPrevImg(null);
    setTokenUri('');
    setTxHash('');
  };

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    const [imgData] = e.dataTransfer.files;
    if (imgData) {
      URL.revokeObjectURL(prevImg);
      changeInput('imgFile', imgData);
      setPrevImg(URL.createObjectURL(imgData));
    }
  };

  const handleImage = async e => {
    const [imgData] = e.target.files;
    if (imgData) {
      URL.revokeObjectURL(prevImg);
      changeInput('imgFile', imgData);
      setPrevImg(URL.createObjectURL(imgData));
    }
  };

  const handleFileInput = () => {
    fileInput.current;
    fileInput.current.click();
  };

  const createImgIpfsHash = async () => {
    const data = new FormData();
    data.append('file', input.imgFile);
    const { data: uploadRes } = await uploadImg2Ipfs(data);
    return uploadRes.IpfsHash;
  };

  const handleUploadNft = async e => {
    e.preventDefault();
    const { name, description } = input;
    const ipfsHash = await createImgIpfsHash();
    const nftData = { name, description, image: `ipfs://${ipfsHash}` };
    const { data: uploadDataRes } = await sendJson2Ipfs(JSON.stringify(nftData));
    setTokenUri(uploadDataRes.IpfsHash);
  };

  const getSigner = () => {
    const pKey = process.env.REACT_APP_PRIVATE_KEY;
    const wallet = new ethers.Wallet(pKey);
    const provider = new ethers.providers.InfuraProvider('ropsten');
    return wallet.connect(provider);
  };

  const mintNft = useCallback(async () => {
    if (tokenUri) {
      try {
        const providerSigner = getSigner();
        const contractAddr = '0x7528D0211c5926EbFddFE9FBCafFDdC8F6adC5f8';
        const contract = new ethers.Contract(contractAddr, HannahNftAbi, providerSigner);
        // const uri = `ipfs://${tokenUri}`;
        // ipfs를 붙여 민팅을 하게 되면 메타마스크에서 이미지가 나타나지 않는다.
        const mintingNft = await contract.safeMint(input.to, tokenUri);
        if (mintingNft) {
          setTxHash(mintingNft.hash);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [tokenUri, input.to]);

  useEffect(() => {
    mintNft();
  }, [mintNft]);

  return (
    <section className="container__wallet wide">
      <h4 className="title">Mint NFT</h4>
      <form className="row">
        <div className="wallet-data__wrapper">
          <span className="wallet--label" htmlFor="nftImg">
            🖼 image:{' '}
          </span>
          <input type="file" name="nftImg" ref={fileInput} onChange={handleImage} />
          <div
            className="container__img"
            onClick={handleFileInput}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            {input.imgFile ? (
              <img src={prevImg} alt={input?.imgFile?.name ?? 'NFT Image'} />
            ) : (
              <div>Select a file or drag here</div>
            )}
          </div>
        </div>

        <div className="column gap10">
          <InputForm label={'💳 Address To'} name={'to'} value={input.to} onChange={handleInput} />
          <InputForm label={'🤔 Name'} name={'name'} value={input.name} onChange={handleInput} />
          <div className="wallet-data__wrapper">
            <span className="wallet--label" htmlFor="nftDesc">
              ✍️ Description:{' '}
            </span>
            <div className="input__row">
              <textarea
                name={'description'}
                value={input.description ?? ''}
                onChange={handleInput}
              />
            </div>
          </div>
        </div>
      </form>
      <div className="row flex-end">
        {txHash && (
          <a href={`https://ropsten.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
            Etherscan에서 확인하기
          </a>
        )}
        <button onClick={resetForm}>Reset</button>
        <button
          className="button__mint"
          onClick={handleUploadNft}
          disabled={!input.imgFile || !input.to || !input.name || !input.description}>
          Mint
        </button>
      </div>
    </section>
  );
}

export default MintNft;
