import { ethers } from "ethers";
import { getBuilderRelayerClient } from "../config";
import { getSafeAddress } from "./calc_address";
import { getAllowance, getApproval } from "./token_utils";
import { ADDRESSES } from "./token_utils";
import { erc20Interface } from "./token_utils";
import { erc1155Interface } from "./token_utils";

export async function setupPolymarketAllowance(signer: ethers.Wallet, safeAddress: string) {
  const currentAllowance = await getAllowance(signer, safeAddress);
  if (currentAllowance !== 0n) {
    console.info("CTF already has USDCe allowance");
    return true;
  }

  console.info("CTF does not have USDCe allowance, approving now...");

  // Approve USDCe for CTF contract
  const approveTx = {
    to: ADDRESSES.USDCe,
    data: erc20Interface.encodeFunctionData("approve", [
      ADDRESSES.CTF,
      ethers.constants.MaxUint256
    ]),
    value: "0",
    gasLimit: ethers.utils.hexlify(1000000), // TODO: control or estimate gas limit?
  };

  const relayerClient = getBuilderRelayerClient(signer);
  const response = await relayerClient.execute([approveTx], "Approve USDCe for CTF");
  const receipt = await response.wait();
  console.info("USDCe allowance transaction sent", response, receipt);

  const newAllowance = await getAllowance(signer, safeAddress);
  return newAllowance !== 0n;
}

export async function setupPolymarketApproval(signer: ethers.Wallet, safeAddress: string) {
  const currentApproval = await getApproval(signer, safeAddress);
  if (currentApproval !== 0n) {
    console.info("CTF is already approved for exchange");
    return true;
  }

  console.info("CTF is not approved for exchange, approving now...");

  const approveAllTx = {
    to: ADDRESSES.CTF,
    data: erc1155Interface.encodeFunctionData("setApprovalForAll", [
      ADDRESSES.CTF_EXCHANGE,
      true
    ]),
    value: "0"
  };

  const relayerClient = getBuilderRelayerClient(signer);
  const response = await relayerClient.execute([approveAllTx], "Approve CTF for exchange");
  const receipt = await response.wait();
  console.info("CTF approval transaction sent", response, receipt);

  const newApproval = await getApproval(signer, safeAddress);
  return newApproval !== 0n;
}

export async function setupSafeApprovals(signer: ethers.Wallet) {
  const safeAddress = getSafeAddress(signer.address);

  // TODO: not sure if can use Promise.all as transactions seem to fail?
  // example: https://polygonscan.com/tx/0xde2f45993d5e0085d8a099f8f4f3df982aa5e911fcf7fbdf3f66e74ad32ea27d
  // so instead performing sequentially until this bug is fixed
  // return Promise.all([
  await setupPolymarketAllowance(signer, safeAddress);
  await setupPolymarketApproval(signer, safeAddress);
  // ])
}

// TODO: pass flag whether to setup allowance & approvals in this function?
export async function deploySafeContract(signer: ethers.Wallet): Promise<string> {
  const safeAddress = getSafeAddress(signer.address);

  // check if safe is already deployed
  const impl = await signer.provider.getStorageAt(safeAddress, 0);
  if (BigInt(impl) !== 0n) {
    return safeAddress;
  }

  // otherwise deploy the Safe wallet
  const relayerClient = getBuilderRelayerClient(signer);
  const response = await relayerClient.deploy();
  const result = await response.wait();
  if (result?.proxyAddress.toLowerCase() !== safeAddress.toLowerCase()) {
    throw new Error(`Safe address mismatch: expected ${safeAddress} but got ${result?.proxyAddress}`);
  }

  return safeAddress;
}
