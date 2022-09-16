import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadImg2Ipfs, sendJson2Ipfs } from '../api/index';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';

import InputForm from './common/InputForm';

function MintNft() {
  const fileInput = useRef(null);
  const [mintAddr, setMintAddr] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [prevImg, setPrevImg] = useState(null);
  const [tokenUri, setTokenUri] = useState('');
  const [txHash, setTxHash] = useState('');

  const resetForm = () => {
    setMintAddr('');
    setName('');
    setDescription('');
    setImgFile(null);
    URL.revokeObjectURL(prevImg);
    setPrevImg(null);
    setTokenUri('');
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
      setImgFile(imgData);
      setPrevImg(URL.createObjectURL(imgData));
    }
  };

  const handleFileInput = () => {
    fileInput.current;
    fileInput.current.click();
  };

  const handleImage = async e => {
    const [imgData] = e.target.files;
    if (imgData) {
      URL.revokeObjectURL(prevImg);
      setImgFile(imgData);
      setPrevImg(URL.createObjectURL(imgData));
    }
  };

  const createImgIpfsHash = async () => {
    const data = new FormData();
    data.append('file', imgFile);
    const { data: uploadRes } = await uploadImg2Ipfs(data);
    return uploadRes.IpfsHash;
  };

  const handleUploadNft = async e => {
    e.preventDefault();
    const ipfsHash = await createImgIpfsHash();
    const nftData = { name, description, image: `ipfs://${ipfsHash}` };
    const { data: uploadDataRes } = await sendJson2Ipfs(JSON.stringify(nftData));
    setTokenUri(uploadDataRes.IpfsHash);
    // setTokenUri(nftData);
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
        const contractAddr = '0x7528D0211c5926EbFddFE9FBCafFDdC8F6adC5f8';
        const providerSigner = getSigner();
        const contract = new ethers.Contract(contractAddr, HannahNftAbi, providerSigner);
        // const uri = `ipfs://${tokenUri}`;
        // ipfs를 붙여 민팅을 하게 되면 메타마스크에서 이미지가 나타나지 않는다.
        // const mintingNft = await contract.safeMint(providerSigner.address, tokenUri);
        const mintingNft = await contract.safeMint(mintAddr, tokenUri);
        if (mintingNft) {
          setTxHash(mintingNft.hash);
          resetForm();
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [tokenUri]);

  useEffect(() => {
    mintNft();
  }, [mintNft]);

  return (
    <div className="container__wallet wide">
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
            {imgFile ? (
              <img src={prevImg} alt={imgFile?.name ?? 'NFT Image'} />
            ) : (
              <div>Select a file or drag here</div>
            )}
          </div>
        </div>
        <div className="column gap10">
          <InputForm
            label={'💳 Address To'}
            value={mintAddr}
            onChange={e => setMintAddr(e.target.value)}
          />
          <InputForm label={'🤔 Name'} value={name} onChange={e => setName(e.target.value)} />
          <div className="wallet-data__wrapper">
            <span className="wallet--label" htmlFor="nftDesc">
              ✍️ Description:{' '}
            </span>
            <div className="input__row">
              <textarea
                name="nftDesc"
                placeholder="e.g. Even cooler than cryptokitties ;)"
                value={description}
                onChange={event => setDescription(event.target.value)}
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
        <button
          className="button__mint"
          onClick={handleUploadNft}
          disabled={!imgFile || !mintAddr || !name || !description}>
          Mint
        </button>
      </div>
    </div>
  );
}

export default MintNft;
