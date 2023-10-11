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

const projectId = "149f84ff95a763d7bccbb4f6cd3cf883";

const { wallets } = getDefaultWallets({
  appName: "HoodyGang",
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
        <MintComponent />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
