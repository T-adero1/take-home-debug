import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { SolanaExtension } from "@magic-ext/solana";

export const magic = new Magic(process.env.REACT_APP_MAGIC_API_KEY, {
  extensions: [
    new OAuthExtension(),
    new SolanaExtension({
      rpcUrl: "dal17.nodes.rpcpool.com", // Bitcoin mainnet RPC// or 'testnet' for testing
    }),
  ],
});
