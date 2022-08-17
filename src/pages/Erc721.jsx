import React, { useState } from 'react';
import axios from 'axios';
import { uploadImg2Ipfs, sendJson2Ipfs } from '../api/index';
import { ethers } from 'ethers';
import HannahNftAbi from '../contracts/HannahNftAbi.json';

function Erc721() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [prevImg, setPrevImg] = useState(null);
  const [tokenUri, setTokenUri] = useState('');
  const [txHash, setTxHash] = useState('');

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
  };

  const getSigner = () => {
    const pKey = '0x15b3eed746443d676410608e93459026a560672cd2032a719cfa2137caa06a80';
    const wallet = new ethers.Wallet(pKey);
    const provider = new ethers.providers.InfuraProvider('ropsten');
    return wallet.connect(provider);
  };

  const mintNft = async () => {
    try {
      await handleUploadNft();
      const contractAddr = '0x7528D0211c5926EbFddFE9FBCafFDdC8F6adC5f8';
      const providerSigner = getSigner();
      const contract = new ethers.Contract(contractAddr, HannahNftAbi, providerSigner);
      const uri = `ipfs://${tokenUri}`;
      const mintingNft = await contract.safeMint(providerSigner.address, uri);
      console.log(mintingNft);
      setTxHash(mintingNft.hash);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="row">
        <div>
          <form>
            <h2>🖼 image: </h2>
            {prevImg && <img src={prevImg} alt="nft image" />}
            <input type="file" onChange={handleImage} />
            <h2>🤔 Name: </h2>
            <input
              type="text"
              placeholder="e.g. My first NFT!"
              onChange={event => setName(event.target.value)}
            />
            <h2>✍️ Description: </h2>
            <input
              type="text"
              placeholder="e.g. Even cooler than cryptokitties ;)"
              onChange={event => setDescription(event.target.value)}
            />
          </form>
          <button onClick={mintNft} disabled={!imgFile || !name || !description}>
            Mint
          </button>
        </div>
      </div>
      {txHash && (
        <a href={`https://ropsten.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
          Etherscan에서 확인하기
        </a>
      )}
    </div>
  );
}

export default Erc721;
