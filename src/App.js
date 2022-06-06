import * as React from "react";
import {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortal from "./utils/WavePortal.json";
import LoadingSpinner from "./LoadingSpinner";

export default function App() {


  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("This is a message.");

  const contractAddress = "0xC180f1384627703E23e9B4615Df868b19F9cd32C";
  


      
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
   /**
  * Implement your connectWallet method here
  */
    const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error)
      }
    }


    const wave = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
          console.log("Mining...", waveTxn.hash);
          
          setIsLoading(true);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
          setIsLoading(false)
          
       //   getAllWaves();
          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }

    }
      /*
   * Create a method that gets all waves from your contract
   */
      const getAllWaves = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);
    
            /*
             * Call the getAllWaves method from your Smart Contract
             */
            const waves = await wavePortalContract.getAllWaves();
    
    
            /*
             * We only need address, timestamp, and message in our UI so let's
             * pick those out
             */
           /* let wavesCleaned = [];
            waves.forEach(wave => {
              wavesCleaned.push({
                address: wave.waver,
                timestamp: new Date(wave.timestamp * 1000),
                message: wave.message
              });
            });
    
            console.log(waves);
*/
            const wavesCleaned = waves.map(wave => {
              return {
                address: wave.waver,
                timestamp: new Date(wave.timestamp * 1000),
                message: wave.message,
              };
            });


            /*
             * Store our data in React State
             */
            setAllWaves(wavesCleaned);
          } else {
            console.log("Ethereum object doesn't exist!")
          }
        } catch (error) {
          console.log(error);
        }
      }
    
      useEffect(() => { //useEffect is called when refersh UI
        checkIfWalletIsConnected();
        let wavePortalContract;
      
        const onNewWave = (from, timestamp, message) => {   //onNewWave is called when emitted event from smart contract.
          console.log("NewWave", from, timestamp, message);
          setAllWaves(prevState => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        };
      
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          getAllWaves();
          wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);
          wavePortalContract.on("NewWave", onNewWave);
        }
      
        return () => {
          if (wavePortalContract) {
           
            wavePortalContract.off("NewWave", onNewWave);

          }
        };
      
      }, []);


  const renderUser = (
    <div className="bio">
      Now we are ready.
    </div>
  );

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Andrija and I worked on Blockchain so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <label for="message">write message to Andrija!</label>
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          />
          
        
        <button className="waveButton" onClick={wave} disabled={isLoading}>
          Wave at Me
        </button>
        {isLoading ? <LoadingSpinner /> : renderUser}

          {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        

        {allWaves.map((wave, index) => {  //is refreshed when allwave value is updated.
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}


