import { ethers } from "ethers";

// TODO: create tests to verify these are the correct values
// params from PolySafeLib.sol @ 0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e
export const IMPLEMENTATION = "0xe51abdf814f8854941b9fe8e3a4f65cab4e7a4a8";
export const DEPLOYER = "0xaacfeea03eb1561c4e67d661e40682bd20e3541b";
export const PROXY_CREATION_CODE = "0x608060405234801561001057600080fd5b5060405161017138038061017183398101604081905261002f916100b9565b6001600160a01b0381166100945760405162461bcd60e51b815260206004820152602260248201527f496e76616c69642073696e676c65746f6e20616464726573732070726f766964604482015261195960f21b606482015260840160405180910390fd5b600080546001600160a01b0319166001600160a01b03929092169190911790556100e7565b6000602082840312156100ca578081fd5b81516001600160a01b03811681146100e0578182fd5b9392505050565b607c806100f56000396000f3fe6080604052600080546001600160a01b0316813563530ca43760e11b1415602857808252602082f35b3682833781823684845af490503d82833e806041573d82fd5b503d81f3fea264697066735822122015938e3bf2c49f5df5c1b7f9569fa85cc5d6f3074bb258a2dc0c7e299bc9e33664736f6c63430008040033";

/**
 * Computes the CREATE2 address for a given deployer, bytecode hash, and salt
 * Equivalent to Solidity's _computeCreate2Address function
 */
export function computeCreate2Address(
  deployer: string,
  bytecodeHash: string,
  salt: string
): string {
  // keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash))
  const packed = ethers.utils.solidityPack(
    ["bytes1", "address", "bytes32", "bytes32"],
    ["0xff", deployer, salt, bytecodeHash]
  );
  const hash = ethers.utils.keccak256(packed);

  // address(uint160(uint256(_data)))
  // Take last 20 bytes (40 hex chars) of the hash
  return ethers.utils.getAddress("0x" + hash.slice(-40));
}

/**
 * Gets the contract bytecode by encoding the proxy creation code with the master copy address
 * Equivalent to Solidity's getContractBytecode function
 */
export function getContractBytecode(masterCopy: string): string {
  // abi.encode(masterCopy) - encodes address as 32 bytes (padded)
  const encodedAddress = ethers.utils.defaultAbiCoder.encode(["address"], [masterCopy]);

  // abi.encodePacked(proxyCreationCode, abi.encode(masterCopy))
  const bytecode = ethers.utils.solidityPack(
    ["bytes", "bytes"],
    [PROXY_CREATION_CODE, encodedAddress]
  );

  return bytecode;
}

/**
 * Gets the Safe address for a given signer
 * Equivalent to Solidity's getSafeAddress function
 */
export function getSafeAddress(signer: string): string {
  // bytes32 salt = keccak256(abi.encode(signer));
  const encoded = ethers.utils.defaultAbiCoder.encode(["address"], [signer]);
  const salt = ethers.utils.keccak256(encoded);

  // bytes32 bytecodeHash = keccak256(getContractBytecode(implementation));
  const bytecode = getContractBytecode(IMPLEMENTATION);
  const bytecodeHash = ethers.utils.keccak256(bytecode);

  return computeCreate2Address(DEPLOYER, bytecodeHash, salt);
}
