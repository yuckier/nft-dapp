import React, { useState } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';
import config from './config.json';

const MintComponent = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [mintAmount, setMintAmount] = useState(1);
    const [totalCost, setTotalCost] = useState(0);

    const [isConnected, setIsConnected] = useState(false);  // Add this line to manage the connection state

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const contractInstance = new web3Instance.eth.Contract(config.contractABI, config.contractAddress);
                setContract(contractInstance);
                setIsConnected(true);
                
                ensureCorrectNetwork(web3Instance);  
            } catch (error) {
                if (error.code === 4001) {
                    // User rejected request
                    alert("Please allow access to your MetaMask account to continue.");
                } else {
                    console.error("User denied account access");
                }
            }
        } else {
            console.error("Ethereum browser not detected!");
        }
    };
    

    const ensureCorrectNetwork = async (web3Instance) => {
        const networkId = await web3Instance.eth.net.getId();
        console.log("Detected Network ID:", networkId);
        if (Number(networkId) !== 5) {
            switchNetworks();
            //alert("Please connect to the Goerli Testnet!");
        }
    };

    const switchNetworks = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }],
            });
        } catch (switchError) {
            console.error(switchError);
            if (switchError.code === 4902) {
                alert('Please add the Goerli network to MetaMask first.');
            }
        }
    };

    const handleMint = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            
            const pricePerNFT = await contract.methods._cost().call();
    
            const bigNumPrice = ethers.BigNumber.from(pricePerNFT.toString());
            const bigNumAmount = ethers.BigNumber.from(mintAmount.toString());
            const bigNumTotalCost = bigNumPrice.mul(bigNumAmount);
    
            const cost = ethers.utils.formatEther(bigNumTotalCost);
            setTotalCost(cost);
    
            // Print these out for troubleshooting
            console.log("Minting amount:", mintAmount);
            console.log("Sender address:", accounts[0]);
            console.log("Sending ETH value:", web3.utils.toWei(cost, 'ether'));
    
            // Gas estimation
            const estimatedGas = await contract.methods.mintNFT(mintAmount).estimateGas({
                from: accounts[0],
                value: web3.utils.toWei(cost, 'ether')
            });
    
            // Getting the current baseFeePerGas from the network
            const currentGasPrice = await web3.eth.getGasPrice();

            console.log("Estimated Gas Units:", estimatedGas);
            console.log("Current Gas Price:", currentGasPrice);
            
            // Sending the transaction with estimated gas and adjusted gas price
            await contract.methods.mintNFT(mintAmount).send({
                from: accounts[0],
                value: web3.utils.toWei(cost, 'ether'),
                gas: estimatedGas,
                maxPriorityFeePerGas: web3.utils.toWei('1.5', 'gwei'),
                maxFeePerGas: web3.utils.toWei((parseInt(currentGasPrice) + 2).toString(), 'gwei')
            });
    
        } catch (error) {
            console.error("Error in minting:", error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            {!isConnected && <button onClick={connectWallet}>Connect Wallet</button>}  {/* Only show the button if not connected */}
            {contract && (
                <div>
                    <h2>Mint NFT</h2>
                    <input type="number" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
                    <div>Total Cost: {totalCost} ETH</div>
                    <button onClick={handleMint}>Mint</button>  
                </div>
            )}
        </div>
    );
}

export default MintComponent;
