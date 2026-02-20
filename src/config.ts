import { RelayClient, RelayerTxType } from "@polymarket/builder-relayer-client";
import { Wallet, providers } from "ethers";
import { BuilderApiKeyCreds, BuilderConfig } from "@polymarket/builder-signing-sdk";
import { ApiKeyCreds } from "@polymarket/clob-client/dist/types";
import { ClobClient } from "@polymarket/clob-client";
import { getSafeAddress } from "./safe/calc_address";

const CHAIN_ID = 137; // Polygon
const URL_CLOB_CLIENT = "https://clob.polymarket.com";
const URL_RELAYE_CLIENT = "https://relayer-v2.polymarket.com/";

export function getSigner(privateKey?: string, rpcUrl?: string) {
  return new Wallet(privateKey ?? process.env.PRIVATE_KEY!, new providers.JsonRpcProvider(rpcUrl ?? process.env.RPC_URL!));
}

let defaultBuilderConfig: BuilderConfig | undefined;
if (process.env.BUILDER_API_KEY && process.env.BUILDER_API_SECRET && process.env.BUILDER_API_PASSPHRASE) {
  defaultBuilderConfig = new BuilderConfig({
    localBuilderCreds: {
      key: process.env.BUILDER_API_KEY!,
      secret: process.env.BUILDER_API_SECRET!,
      passphrase: process.env.BUILDER_API_PASSPHRASE!
    }
  });
}

export function makeBuilderConfig(builderCreds: BuilderApiKeyCreds): BuilderConfig {
  return new BuilderConfig({ localBuilderCreds: builderCreds });
}

export function setDefaultBuilderCreds(builderCreds: BuilderApiKeyCreds): BuilderConfig {
  defaultBuilderConfig = makeBuilderConfig(builderCreds);
  return defaultBuilderConfig;
}

export function getDefaultBuilderConfig(): BuilderConfig {
  if (!defaultBuilderConfig) {
    throw new Error("Builder config not found");
  }

  return defaultBuilderConfig;
}

export function getDefaultUserCreds(): ApiKeyCreds {
  return {
    key: process.env.API_KEY!,
    secret: process.env.API_SECRET!,
    passphrase: process.env.API_PASSPHRASE!
  };
}

/**
 * Returns an instance of ClobClient configured for the builder.
 *
 * - Anonymous: Neither `signer` nor `creds` is required, an anonymous ClobClient is returned only for public API queries.
 * - Register: Requires `signer` but not `creds`, the client is used primarily for API key creation/registration (after which you reinitialize with credentials).
 * - L2 Auth: Requires `creds` but not `signer`, the client uses L2 authentication (API-key based, such as querying orders.
 * - L1 Auth: Requires both `signer` and `creds`, the client can perform fully authenticated actions, such as posting orders.
 *
 * If `builderConfig` is not supplied, the default builder config is used.
 *
 * @param signer - (Optional) An ethers.js Wallet. Determines account context for signing and on-chain auth.
 * @param creds - (Optional) API credentials for L2 authenticated endpoints (trading, querying orders, etc.).
 * @param builderConfig - (Optional) BuilderConfig instance. Uses project-configured default if not supplied.
 * @returns {ClobClient} The configured CLOB client instance.
 */
export function getBuilderClobClient(signer?: Wallet, creds?: ApiKeyCreds, builderConfig?: BuilderConfig): ClobClient {
  const signerAddress = signer ? signer.address : undefined;
  const funderAddress = signer ? getSafeAddress(signerAddress!) : undefined;
  return new ClobClient(
    URL_CLOB_CLIENT,
    CHAIN_ID,      // Polygon mainnet
    signer,
    creds,         // user's API credentials
    2,             // signatureType: 2 for Safe proxy
    funderAddress, // funder address
    undefined,     // geoBlockToken
    false,         // useServerTime
    builderConfig ?? getDefaultBuilderConfig()
  );
}

export function getBuilderRelayerClient(signer: Wallet, builderConfig?: BuilderConfig): RelayClient {
  return new RelayClient(
    URL_RELAYE_CLIENT,
    CHAIN_ID, // Polygon mainnet
    signer,
    builderConfig ?? getDefaultBuilderConfig(),
    RelayerTxType.SAFE
  );
}
