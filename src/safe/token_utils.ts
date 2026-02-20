import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { getBuilderRelayerClient } from "../config";

export const erc20Interface = new Interface([
  "function transfer(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) returns (uint256)"
]);

export const erc1155Interface = new Interface([
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) returns (bool)"
]);

export const ADDRESSES = {
  USDCe: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  CTF: "0x4d97dcd97ec945f40cf65f87097ace5ea0476045",
  CTF_EXCHANGE: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
  NEG_RISK_CTF_EXCHANGE: "0xC5d563A36AE78145C45a50134d48A1215220f80a",
  NEG_RISK_ADAPTER: "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296"
};

export async function getAllowance(signer: ethers.Wallet, safeAddress: string): Promise<bigint> {
  const allowanceTx = {
    to: ADDRESSES.USDCe,
    data: erc20Interface.encodeFunctionData("allowance", [
      safeAddress,  // owner
      ADDRESSES.CTF // spender
    ])
  };
  const currentAllowance = await signer.call(allowanceTx);
  return BigInt(currentAllowance);
}

export async function getApproval(signer: ethers.Wallet, safeAddress: string): Promise<bigint> {
  const approvalTx = {
    to: ADDRESSES.CTF,
    data: erc1155Interface.encodeFunctionData("isApprovedForAll", [
      safeAddress,           // owner
      ADDRESSES.CTF_EXCHANGE // operator
    ]),
    gasLimit: ethers.utils.hexlify(1000000), // TODO: control or estimate gas limit?
  };
  const currentApproval = await signer.call(approvalTx);
  return BigInt(currentApproval);
}

export async function withdrawUSDCe(signer: ethers.Wallet, recipient: string, amount: number) {
  const transferTx = {
    to: ADDRESSES.USDCe,
    data: erc20Interface.encodeFunctionData("transfer", [
      recipient,
      ethers.utils.parseUnits(amount.toString(), 6)
    ]),
    value: "0"
  };

  const relayerClient = getBuilderRelayerClient(signer);
  const response = await relayerClient.execute([transferTx], "Withdraw USDCe from Safe");
  const receipt = await response.wait();
  console.info("USDCe withdrawal transaction sent", response, receipt);

  const newBalance = await signer.call(transferTx);
  return BigInt(newBalance) !== 0n;
}
