// Network enum to identify supported blockchains
export const Network = {
  ETHEREUM: "ethereum",
  ETHEREUM_SEPOLIA: "ethereum-sepolia",
  BITCOIN: "bitcoin",
  BITCOIN_TESTNET: "bitcoin-testnet",
};

// Get RPC URL for the current network
export const getNetworkUrl = (network) => {
  switch (network) {
    case Network.ETHEREUM:
      return "https://ethereum-rpc.publicnode.com";
    case Network.ETHEREUM_SEPOLIA:
      return "https://ethereum-sepolia-rpc.publicnode.com";
    case Network.BITCOIN:
      return "https://bitcoin-rpc.publicnode.com";
    case Network.BITCOIN_TESTNET:
      return "https://bitcoin-testnet-rpc.publicnode.com";
    default:
      throw new Error("Network not supported");
  }
};

// Get chain ID for the current network (Ethereum only)
export const getChainId = (network) => {
  switch (network) {
    case Network.ETHEREUM:
      return 1;
    case Network.ETHEREUM_SEPOLIA:
      return 11155111;
    default:
      return null; // Bitcoin doesn't use chainId in the same way
  }
};

// Get network name for display purposes
export const getNetworkName = (network) => {
  switch (network) {
    case Network.ETHEREUM:
      return "Ethereum Mainnet";
    case Network.ETHEREUM_SEPOLIA:
      return "Ethereum Sepolia";
    case Network.BITCOIN:
      return "Bitcoin Mainnet";
    case Network.BITCOIN_TESTNET:
      return "Bitcoin Testnet";
    default:
      return "Unknown Network";
  }
};

// Get network token symbol
export const getNetworkToken = (network) => {
  switch (network) {
    case Network.ETHEREUM:
    case Network.ETHEREUM_SEPOLIA:
      return "ETH";
    case Network.BITCOIN:
    case Network.BITCOIN_TESTNET:
      return "BTC";
    default:
      return "Unknown";
  }
};
