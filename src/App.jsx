import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
// Constants
const TWITTER_HANDLE = 'sg43849488';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = '0xb5C48Dc8ecd5434e094823F11d1c3b2ea4AC40FA';
const MAX_MINT = 50;
const COLLECTION_LINK = 'https://rinkeby.rarible.com/collection/0xb5c48dc8ecd5434e094823f11d1c3b2ea4ac40fa';

const App = () => {
  // keep track if user is logged in on App level
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalMinted, setTotalMinted] = useState(0);

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      // setupEventListener();
      getTotalNFTsMintedSoFar();
    } else {
      console.log("No authorized account found")
    }
  }
  
  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      getTotalNFTsMintedSoFar();
    } catch (error) {
      console.log(error)
    }
  }

const askContractToMintNft = async () => {
  try {
    
    const { ethereum } = window;

    if (ethereum) {
      setupEventListener();

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);      
      console.log("Going to pop wallet now to pay gas...")
      let nftTxn = await connectedContract.makeAnEpicNFT();

      console.log("Mining...please wait.")
      await nftTxn.wait();
      
      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

// Render Methods
const renderNotConnectedContainer = () => (
  <button onClick={connectWallet} className="cta-button connect-wallet-button">
    Connect to Wallet
  </button>
);

const getTotalNFTsMintedSoFar  = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        let totalMinted = await connectedContract.getTotalMinted();
        console.log(`Total NFTs Minted: ${totalMinted}`)
        setTotalMinted(totalMinted.toNumber())      
        } else {
        console.log("Ethereum object doesn't exist!");
      } 
    } catch (error) {
      console.log(error);
  }
}

/*
* This runs our function when the page loads.
*/
useEffect(() => {
  checkIfWalletIsConnected();
}, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ?
            renderNotConnectedContainer() :
      /** Add askContractToMintNft Action for the onClick event **/
          <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
          </button>
          }
        </div>
        <div className="mint-counter">
          { currentAccount &&
          <p className="gradient-text"><i>{totalMinted} out of {MAX_MINT} NFTs minted</i></p>
          }
        </div>
         <div className="collection-container">
            <a
              className="footer-text"
              href={COLLECTION_LINK}
              target="_blank"
              rel="noreferrer"
            >Check out the collection on Rarible</a>
          </div>
        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`follow me @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;