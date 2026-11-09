// tests/mocks/web3Mock.ts

export const MOCK_TX_HASH = "0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0";
export const MOCK_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

/**
 * Injects an EIP-1193 compatible window.ethereum provider into browser page context.
 */
export async function injectMockWeb3Provider(page: any) {
  await page.addInitScript(({ txHash }: { txHash: string }) => {
    const listeners: Record<string, Function[]> = {};

    (window as any).ethereum = {
      isMetaMask: true,
      chainId: "0xa4b1", // Arbitrum One (42161)
      networkVersion: "42161",
      selectedAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      
      request: async ({ method, params }: { method: string; params?: any[] }) => {
        switch (method) {
          case "eth_requestAccounts":
          case "eth_accounts":
            return ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"];

          case "eth_chainId":
            return "0xa4b1";

          case "eth_sendTransaction":
            // Simulates wallet signature approval and returns dynamic mock txHash
            return txHash;

          case "eth_estimateGas":
            return "0x22ce5"; // 142,565 gas

          case "eth_gasPrice":
            return "0x3b9aca00"; // 1 Gwei

          default:
            return null;
        }
      },

      on: (event: string, callback: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
      },

      removeListener: (event: string, callback: Function) => {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
      },
    };
  }, { txHash: MOCK_TX_HASH });
}
