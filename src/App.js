import React from "react";
import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import "./App.css";
import MintComponent from "./MintComponent";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const projectId = "a10bb5aab9167131c79cc6df874d98af";

const { wallets } = getDefaultWallets({
  appName: "MintDapp",
  projectId: projectId,
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <div class="logo">
          <img src="/logo.png"></img>
        </div>
        <MintComponent />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
