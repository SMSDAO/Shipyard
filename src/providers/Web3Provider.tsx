"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, arbitrum, base, polygon } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30s
    },
  },
});

// Wagmi v2 EVM Configuration
export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, polygon],
  connectors: [
    injected(),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "3fcc6bba2d1de962c2f1e69aec3e4a28" }),
    coinbaseWallet({ appName: "Shipyard Enterprise" }),
  ],
  transports: {
    [mainnet.id]: http(
      import.meta.env.VITE_ETHEREUM_RPC ||
      (import.meta.env.VITE_ALCHEMY_KEY
        ? `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
        : "https://cloudflare-eth.com")
    ),
    [arbitrum.id]: http(
      import.meta.env.VITE_ARBITRUM_RPC ||
      (import.meta.env.VITE_ALCHEMY_KEY
        ? `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
        : "https://arb1.arbitrum.io/rpc")
    ),
    [base.id]: http(
      import.meta.env.VITE_BASE_RPC ||
      (import.meta.env.VITE_ALCHEMY_KEY
        ? `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
        : "https://mainnet.base.org")
    ),
    [polygon.id]: http(
      import.meta.env.VITE_POLYGON_RPC ||
      (import.meta.env.VITE_ALCHEMY_KEY
        ? `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
        : "https://polygon-rpc.com")
    ),
  },
});

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const solanaEndpoint = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl("mainnet-beta");
  const solanaWallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={solanaEndpoint}>
          <SolanaWalletProvider autoConnect wallets={solanaWallets}>
            {children}
          </SolanaWalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
