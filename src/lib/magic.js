import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { BitcoinExtension } from "@magic-ext/bitcoin";
import { Network, getNetworkUrl, getChainId } from "./networkUtils";

// Create Magic instance for a specific network
export const createMagicInstance = (network) => {
  const apiKey = process.env.REACT_APP_MAGIC_API_KEY;

  // Configure network-specific settings
  switch (network) {
    case Network.ETHEREUM:
    case Network.ETHEREUM_SEPOLIA:
      return new Magic(apiKey, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: getNetworkUrl(network),
          chainId: getChainId(network),
        },
      });

    case Network.BITCOIN:
    case Network.BITCOIN_TESTNET:
      return new Magic(apiKey, {
        extensions: [
          new OAuthExtension(),
          new BitcoinExtension({
            rpcUrl: getNetworkUrl(network),
            network: network === Network.BITCOIN ? "mainnet" : "testnet",
          }),
        ],
      });

    default:
      throw new Error(`Network ${network} is not supported`);
  }
};

// Default Magic instance (Ethereum Mainnet)
export const magic = createMagicInstance(Network.ETHEREUM);
