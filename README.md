# Blockchain Wallet
해당 프로젝트에선 기본 트랜젝션(코인 송금), ERC20 송금, ERC721(NFT) minting 그리고 nft 보내기, Contract의 트랜젝션 리스트를 다뤘습니다.
리서치 및 프로젝트에 관한 자세한 기술은 [여기서](https://velog.io/@seulgea/BC-Ethereum-Proj) 볼 수 있습니다.

## Directory Structure
```bash
project
├── 📁public
└── 📁src
    ├── 📁api
    │   └── sendNft.js
    ├── 📁components
    │   ├── 📁common
    │   │   ├── GivenDataForm.jsx
    │   │   └── InputForm.jsx
    │   ├── MetaMaskApp.jsx
    │   ├── MetaMaskErc20.jsx
    │   ├── MintNft.jsx
    │   ├── NewPKey.jsx
    │   ├── NewPKeyErc20.jsx
    │   ├── SendNft.jsx
    │   └── TransactionList.jsx
    ├── 📁contracts
    │   ├── HannahFirstTokenAbi.json
    │   └── HannahNftAbi.json
    ├── 📁hooks
    │   ├── useBalance.js
    │   ├── useInput.js
    │   └── useNetworks.js
    ├── 📁pages
    │   ├── Erc20.jsx
    │   ├── Erc721.jsx
    │   ├── Transaction.jsx
    │   └── Transfer.jsx
    └── App.js
```
### 📁api
통신할때 쓰이는 함수를 정리해 놓은 디렉토리
- SendNft.js: 이미지 및 데이터를 IPFS에 업로드 할 때 쓰이는 함수 존재

### 📁components
컴포넌트파일을 모아놓은 디렉토리
- MetaMaskApp.jsx: Transfer(기본 트랜젝션 송금)페이지에서 쓰이는 컴포넌트로, MetaMask extension과 연동해 사용
- MetaMaksErc20.jsx: ERC20 페이지에서 메타마스크에 연결하고, HannahFirstToken(HFT)를 송금
- MintNft.jsx: ERC721페이지에서 사용되며, ipfs를 이용해 이미지를 업로드해 민팅
- NewPKey.jsx: Transfer(기본 트랜젝션 송금)페이지에서 사용하고, 개인키를 생성해 트랜잭션(기본) 전송
- NewPKeyErc20.jsx: ERC20 페이지에서 랜덤한 개인키 생성해 ERC20 토큰 송금
- SendNft.jsx: ERC721페이지, 생성된 NFT 소유권 이전
- TransactionList.jsx: Transaction List 페이지에 쓰이는 거래 리스트 컴포넌트
#### 📁common
여러곳에서 재사용성이 높은 컴포넌트들이 저장된 디렉토리
- GivenDataForm.jsx: 데이터를 가져와서 보여주는 형태의 컴포넌트
- InputForm.jsx: Input태그를 사용하는 컴포넌트

### 📁contracts
ERC20, ERC721 Smart Contract에 관련된 디렉토리
- HannahFirstTokenAbi.json: ERC20 계약서 ABI파일
- HannahNftAbi.json: ERC721 계약서 ABI파일

### 📁hooks
커스텀 훅(자주 사용하는 기능을 커스텀 훅으로 생성)들을 모아놓은 디렉토리
- useBalance.js: coin, token balance 및 symbol을 가져오는 커스텀 훅
- useInput.js: input 상태관리하는 커스텀 훅
- useNetworks.js: network(provider에 쓰이는) 상태관리 커스텀 훅

### 📁pages
브라우저에서 렌더링하는 페이지를 모아놓은 디렉토리
- Erc20.jsx: ERC20 페이지
- Erc721.jsx: ERC721 페이지
- Transaction.jsx: Contract Address Transaction List 페이지
- Transfer.jsx: 기본 Coin 송금 페이지

### App.js
네비게이션, 라우트 설정된 파일(레이아웃도 이파일에 설정되어 있다.)
