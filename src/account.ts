import { ethers } from "ethers";
import { ApiKeyCreds, ClobClient } from "@polymarket/clob-client";
import { getBuilderClobClient } from "./config";
import { getSafeAddress } from "./safe/calc_address";

export type PolymarketAccountKeys = {
  privateKey: string;
  // signerAddress: string;
  // safeAddress: string;
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
}

export type PolymarketAccountKeysWithAddresses = PolymarketAccountKeys & {
  signerAddress: string;
  safeAddress: string;
}

// TODO: implement methods: save, static load, static deploy, approve, etc.?
export class PolymarketAccount {
  signer: ethers.Wallet;
  signerAddress: string;
  safeAddress: string;
  creds: ApiKeyCreds;
  clob: ClobClient;

  constructor(signer: ethers.Wallet, creds: ApiKeyCreds) {
    this.signer = signer;
    this.signerAddress = this.signer.address;
    this.safeAddress = getSafeAddress(this.signerAddress);
    this.creds = creds;
    this.clob = getBuilderClobClient(this.signer, this.creds);
  }
}
