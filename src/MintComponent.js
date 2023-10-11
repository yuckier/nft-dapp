import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNetwork, useWalletClient } from "wagmi";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { parseEther } from "viem";
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import config from "./config.json";
import abi from "./abi.json";

const MintComponent = () => {
  const { data: signer } = useWalletClient();
  const { chain, chains } = useNetwork();

  const [mintAmount, setMintAmount] = useState(1);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const cost = mintAmount * config.DISPLAY_COST;
    setTotalCost(parseInt(cost * 100000) / 100000);
  }, [mintAmount]);

  const handleMint = async () => {
    const { hash } = await writeContract({
      mode: "recklesslyUnprepared",
      address: config.CONTRACT_ADDRESS,
      abi: abi,
      functionName: "mintNFT",
      args: [mintAmount],
      value: parseEther(totalCost.toString()),
    });
    await waitForTransaction({ hash });

    toast.success("Mint successfully!");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <div style={{ margin: "auto", width: "fit-content" }}>
        <ConnectButton />
      </div>
      {signer && chains[0]?.id == chain?.id && (
        <div style={{ marginTop: "100px" }}>
          <h2>Mint NFT</h2>
          <input
            type="number"
            min={0}
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />
          <div>Total Cost: {totalCost} ETH</div>
          <button onClick={handleMint}>Mint</button>
        </div>
      )}
      <ToastContainer position="top-center" />
    </div>
  );
};

export default MintComponent;
