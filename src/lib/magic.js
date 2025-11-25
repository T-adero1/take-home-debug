import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { HederaExtension } from "@magic-ext/hedera";
import { SolanaExtension } from "@magic-ext/solana";
import { BitcoinExtension } from "@magic-ext/bitcoin";
import { EVMExtension } from "@magic-ext/evm";

export const magic = new Magic(process.env.REACT_APP_MAGIC_API_KEY, {
  extensions: [
    new OAuthExtension(),
    // EVM chains - Polygon, Ethereum, and Base
    new EVMExtension([
      {
        rpcUrl: "https://polygon-rpc.com/",
        chainId: 137,
        default: true,
      }]),
  ],
});
