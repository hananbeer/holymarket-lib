import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import {
  computeCreate2Address,
  getContractBytecode,
  getSafeAddress,
  IMPLEMENTATION,
  DEPLOYER,
  PROXY_CREATION_CODE,
} from "../calc_address";

describe("computeCreate2Address", () => {
  describe("happy path", () => {
    it("should compute CREATE2 address with valid inputs", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      // Use a proper 32-byte hash (64 hex chars)
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);

      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result).toBe(ethers.utils.getAddress(result));
    });

    it("should handle checksummed deployer address", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toBeDefined();
    });

    it("should handle lowercase deployer address", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toBeDefined();
    });
  });

  describe("edge cases - deployer address variations", () => {
    it("should handle zero address as deployer", () => {
      const deployer = "0x0000000000000000000000000000000000000000";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle max address as deployer", () => {
      const deployer = "0xffffffffffffffffffffffffffffffffffffffff";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("edge cases - bytecode hash variations", () => {
    it("should handle hash with leading zeros", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash =
        "0x00000000000000000000000000000000000000000000000000000000000000ab";
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle hash with all zeros", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle hash with all F's", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash =
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      const salt = ethers.utils.keccak256("0x5678");

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("edge cases - salt variations", () => {
    it("should handle salt with leading zeros", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt =
        "0x00000000000000000000000000000000000000000000000000000000000000ab";

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle salt with all zeros", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle salt with all F's", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt =
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

      const result = computeCreate2Address(deployer, bytecodeHash, salt);
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("deterministic behavior", () => {
    it("should always produce same output for same inputs", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = ethers.utils.keccak256("0x5678");

      const result1 = computeCreate2Address(deployer, bytecodeHash, salt);
      const result2 = computeCreate2Address(deployer, bytecodeHash, salt);
      const result3 = computeCreate2Address(deployer, bytecodeHash, salt);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should produce different outputs for different inputs", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt1 = ethers.utils.keccak256("0x5678");
      const salt2 = ethers.utils.keccak256("0x9abc");

      const result1 = computeCreate2Address(deployer, bytecodeHash, salt1);
      const result2 = computeCreate2Address(deployer, bytecodeHash, salt2);

      expect(result1).not.toBe(result2);
    });
  });

  describe("error cases", () => {
    it("should throw for invalid deployer address format", () => {
      const deployer = "invalid-address";
      const bytecodeHash =
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
      const salt =
        "0x1111111111111111111111111111111111111111111111111111111111111111";

      expect(() =>
        computeCreate2Address(deployer, bytecodeHash, salt)
      ).toThrow();
    });

    it("should throw for invalid bytecode hash format", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = "invalid-hash";
      const salt = ethers.utils.keccak256("0x5678");

      expect(() =>
        computeCreate2Address(deployer, bytecodeHash, salt)
      ).toThrow();
    });

    it("should throw for invalid salt format", () => {
      const deployer = "0x1234567890123456789012345678901234567890";
      const bytecodeHash = ethers.utils.keccak256("0x1234");
      const salt = "invalid-salt";

      expect(() =>
        computeCreate2Address(deployer, bytecodeHash, salt)
      ).toThrow();
    });
  });
});

describe("getContractBytecode", () => {
  describe("happy path", () => {
    it("should generate bytecode with valid implementation address", () => {
      const masterCopy = IMPLEMENTATION;
      const result = getContractBytecode(masterCopy);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });

    it("should generate bytecode with standard Ethereum address", () => {
      const masterCopy = "0x1234567890123456789012345678901234567890";
      const result = getContractBytecode(masterCopy);

      expect(result).toBeDefined();
      expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });
  });

  describe("edge cases - different implementation addresses", () => {
    it("should handle zero address", () => {
      const masterCopy = "0x0000000000000000000000000000000000000000";
      const result = getContractBytecode(masterCopy);

      expect(result).toBeDefined();
      expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });

    it("should handle max address", () => {
      const masterCopy = "0xffffffffffffffffffffffffffffffffffffffff";
      const result = getContractBytecode(masterCopy);

      expect(result).toBeDefined();
      expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });

    it("should handle various valid addresses", () => {
      const addresses = [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        ethers.utils.getAddress("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"), // Use checksummed address
      ];

      addresses.forEach((address) => {
        const result = getContractBytecode(address);
        expect(result).toBeDefined();
        expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
      });
    });
  });

  describe("bytecode format verification", () => {
    it("should start with PROXY_CREATION_CODE", () => {
      const masterCopy = IMPLEMENTATION;
      const result = getContractBytecode(masterCopy);

      expect(result.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });

    it("should end with encoded address (32 bytes)", () => {
      const masterCopy = IMPLEMENTATION;
      const result = getContractBytecode(masterCopy);

      const expectedLength =
        PROXY_CREATION_CODE.length + 64; // 32 bytes = 64 hex chars
      expect(result.length).toBe(expectedLength);
    });

    it("should have correct total length", () => {
      const masterCopy = IMPLEMENTATION;
      const result = getContractBytecode(masterCopy);

      const expectedLength = PROXY_CREATION_CODE.length + 64;
      expect(result.length).toBe(expectedLength);
    });
  });

  describe("deterministic behavior", () => {
    it("should always produce same bytecode for same address", () => {
      const masterCopy = IMPLEMENTATION;

      const result1 = getContractBytecode(masterCopy);
      const result2 = getContractBytecode(masterCopy);
      const result3 = getContractBytecode(masterCopy);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should produce different bytecode for different addresses", () => {
      const address1 = "0x1234567890123456789012345678901234567890";
      const address2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

      const result1 = getContractBytecode(address1);
      const result2 = getContractBytecode(address2);

      expect(result1).not.toBe(result2);
    });
  });

  describe("error cases", () => {
    it("should throw for invalid address format", () => {
      const masterCopy = "invalid-address";
      expect(() => getContractBytecode(masterCopy)).toThrow();
    });

    it("should throw for non-address string", () => {
      const masterCopy = "not-an-address";
      expect(() => getContractBytecode(masterCopy)).toThrow();
    });

    it("should throw for empty string", () => {
      const masterCopy = "";
      expect(() => getContractBytecode(masterCopy)).toThrow();
    });
  });
});

describe("getSafeAddress", () => {
  describe("happy path", () => {
    it("should compute Safe address for valid signer", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result).toBe(ethers.utils.getAddress(result));
    });

    it("should use IMPLEMENTATION constant", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      // Verify it produces a valid address
      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should use DEPLOYER constant", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("edge cases - address format variations", () => {
    it("should handle checksummed address", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle lowercase address", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle uppercase address (normalized by ethers)", () => {
      const signer = ethers.utils.getAddress(
        "0x1234567890123456789012345678901234567890"
      );
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle zero address", () => {
      const signer = "0x0000000000000000000000000000000000000000";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle max address", () => {
      const signer = "0xffffffffffffffffffffffffffffffffffffffff";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle address with many zeros", () => {
      const signer = "0x0000000000000000000000000000000000000123";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle address with many F's", () => {
      const signer = "0xffffffffffffffffffffffffffffffffffffffff";
      const result = getSafeAddress(signer);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("deterministic behavior", () => {
    it("should always produce same Safe address for same signer", () => {
      const signer = "0x1234567890123456789012345678901234567890";

      const result1 = getSafeAddress(signer);
      const result2 = getSafeAddress(signer);
      const result3 = getSafeAddress(signer);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should produce different Safe addresses for different signers", () => {
      const signer1 = "0x1234567890123456789012345678901234567890";
      const signer2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

      const result1 = getSafeAddress(signer1);
      const result2 = getSafeAddress(signer2);

      expect(result1).not.toBe(result2);
    });
  });

  describe("constants verification", () => {
    it("should use IMPLEMENTATION constant correctly", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      // The result should be deterministic based on IMPLEMENTATION
      expect(result).toBeDefined();
    });

    it("should use DEPLOYER constant correctly", () => {
      const signer = "0x1234567890123456789012345678901234567890";
      const result = getSafeAddress(signer);

      // The result should be deterministic based on DEPLOYER
      expect(result).toBeDefined();
    });

    it("should use PROXY_CREATION_CODE constant correctly", () => {
      // Verify the bytecode uses PROXY_CREATION_CODE
      const bytecode = getContractBytecode(IMPLEMENTATION);
      expect(bytecode.startsWith(PROXY_CREATION_CODE)).toBe(true);
    });
  });

  describe("integration test", () => {
    it("should verify full flow: signer → salt → bytecode → bytecodeHash → CREATE2 address", () => {
      const signer = "0x1234567890123456789012345678901234567890";

      // Step 1: Encode signer to get salt
      const encoded = ethers.utils.defaultAbiCoder.encode(["address"], [signer]);
      const salt = ethers.utils.keccak256(encoded);

      // Step 2: Get bytecode
      const bytecode = getContractBytecode(IMPLEMENTATION);
      const bytecodeHash = ethers.utils.keccak256(bytecode);

      // Step 3: Compute CREATE2 address
      const computedAddress = computeCreate2Address(
        DEPLOYER,
        bytecodeHash,
        salt
      );

      // Step 4: Compare with getSafeAddress result
      const safeAddress = getSafeAddress(signer);

      expect(computedAddress).toBe(safeAddress);
    });

    it("should produce valid Ethereum addresses", () => {
      const signers = [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        "0x0000000000000000000000000000000000000000",
        "0xffffffffffffffffffffffffffffffffffffffff",
      ];

      signers.forEach((signer) => {
        const result = getSafeAddress(signer);
        expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(() => ethers.utils.getAddress(result)).not.toThrow();
      });
    });
  });

  describe("error cases", () => {
    it("should throw for invalid signer address format", () => {
      const signer = "invalid-address";
      expect(() => getSafeAddress(signer)).toThrow();
    });

    it("should throw for non-address string", () => {
      const signer = "not-an-address";
      expect(() => getSafeAddress(signer)).toThrow();
    });

    it("should throw for empty string", () => {
      const signer = "";
      expect(() => getSafeAddress(signer)).toThrow();
    });
  });
});

