import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import { getSigner } from "./config";
import { deploySafeContract, setupSafeApprovals } from "./safe/deploy";
import { type PolymarketAccountKeysWithAddresses } from "./account";

const HOST = "https://clob.polymarket.com";
const CHAIN_ID = 137; // Polygon

async function deriveApiKey(signer: ethers.Wallet) {
  const clobClient = new ClobClient(
    HOST,
    CHAIN_ID,
    signer,    // EOA
    undefined, // creds - will be created
    2,         // signatureType: 2 for Safe proxy wallet
  );

  const creds = await clobClient.createOrDeriveApiKey();
  return creds;
}

/*
  prepare a new Polymarket Safe account:

  1. deploy Safe contract if needed
  2. setup USDCe allowance and CTF approvals if needed
  3. derive or create API keys if needed
*/
export async function prepareNewPolymarketAccount(privateKey: string): Promise<PolymarketAccountKeysWithAddresses> {
  const signer = getSigner(privateKey);
  const safeAddress = await deploySafeContract(signer);

  await setupSafeApprovals(signer);

  const creds = await deriveApiKey(signer);

  return {
    privateKey,
    signerAddress: signer.address,
    safeAddress,
    apiKey: creds.key,
    apiSecret: creds.secret,
    apiPassphrase: creds.passphrase,
  };
}
