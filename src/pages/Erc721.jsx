import React, { useState } from 'react';
import axios from 'axios';
import { uploadImg2Ipfs, sendJson2Ipfs } from '../api/index';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';
import { useEffect } from 'react';
import { useCallback } from 'react';
import useAddressInput from '../hooks/useAddressInput';
import useCoinInput from '../hooks/useCoinInput';

function Erc721() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [prevImg, setPrevImg] = useState(null);
  const [tokenUri, setTokenUri] = useState('');
  const [txHash, setTxHash] = useState('');
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setImgFile(null);
    URL.revokeObjectURL(prevImg);
    setPrevImg(null);
    setTokenUri('');
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

  const handleUploadNft = async () => {
    const ipfsHash = await createImgIpfsHash();
    const nftData = { name, description, image: `ipfs://${ipfsHash}` };
    const { data: uploadDataRes } = await sendJson2Ipfs(JSON.stringify(nftData));
    setTokenUri(uploadDataRes.IpfsHash);
    // setTokenUri(nftData);
  };

  const handleTransferNft = async () => {
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
    if (transferringNft) alert('NFT 전송 성공');
  };

  const getSigner = () => {
    const pKey = '0x15b3eed746443d676410608e93459026a560672cd2032a719cfa2137caa06a80';
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
        const mintingNft = await contract.safeMint(providerSigner.address, tokenUri);
        console.log(mintingNft);
        setTxHash(mintingNft.hash);
        resetForm();
      } catch (error) {
        console.log(error);
      }
    }
  }, [tokenUri]);

  useEffect(() => {
    mintNft();
  }, [mintNft]);

  return (
    <div>
      <div className="row">
        <div className="container__wallet">
          <form>
            <div className="input__wrapper">
              <label htmlFor="nftImg">🖼 image: </label>
              <input type="file" name="nftImg" />
              <div className="container__img">
                <img src={imgFile} alt="nft image" />
              </div>
            </div>
            <div className="input__wrapper">
              <label htmlFor="nftName">🤔 Name: </label>
              <div className="input__row">
                <input
                  type="text"
                  name="nftName"
                  placeholder="e.g. My first NFT!"
                  value={name}
                  onChange={event => setName(event.target.value)}
                />
              </div>
            </div>
            <div className="input__wrapper">
              <label htmlFor="nftDesc">✍️ Description: </label>
              <div className="input__row">
                <textarea
                  name="nftDesc"
                  placeholder="e.g. Even cooler than cryptokitties ;)"
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                />
              </div>
            </div>
          </form>
          <button onClick={handleUploadNft} disabled={!imgFile || !name || !description}>
            Mint
          </button>

          {txHash && (
            <a href={`https://ropsten.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              Etherscan에서 확인하기
            </a>
          )}
        </div>
        <div className="container__wallet">
          <div className="input__wrapper">
            <label htmlFor="from">From: </label>
            <div className="input__row">
              <input type="text" name="from" value={fromAddr} onChange={handleFromAddr} />
            </div>
          </div>
          <div className="input__wrapper">
            <label htmlFor="to">To: </label>
            <div className="input__row">
              <input type="text" name="to" value={toAddr} onChange={handleToAddr} />
            </div>
          </div>
          <div className="input__wrapper">
            <label htmlFor="tokenId">Token Id: </label>
            <div className="input__row">
              <input type="text" name="tokenId" value={tokenId} onChange={handleTokenId} />
            </div>
          </div>
          <button onClick={handleTransferNft} disabled={!fromAddr || !toAddr || !tokenId}>
            send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Erc721;
