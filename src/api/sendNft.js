import axios from 'axios';

const uploadImg2Ipfs = async data => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  try {
    const res = await axios.post(url, data, {
      headers: {
        // pinata_api_key: `${process.env.REACT_APP_PINATA_KEY}`,
        // pinata_secret_api_key: `${process.env.REACT_APP_PINATA_SECRET}`,
        // 'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
    });

    return res;
  } catch (error) {
    console.log(error);
  }
};

const sendJson2Ipfs = async data => {
  try {
    const url = 'https://api.pinata.cloud/pinning/pinJsonToIPFS';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
    };
    const res = await axios.post(url, data, config);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export { uploadImg2Ipfs, sendJson2Ipfs };
