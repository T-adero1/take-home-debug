import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import { HederaExtension } from "@magic-ext/hedera";

export const magic = new Magic(process.env.REACT_APP_MAGIC_API_KEY, {
  extensions: [
    new OAuthExtension(),
    new HederaExtension({
      network: "testnet",
    }),
  ],
});
