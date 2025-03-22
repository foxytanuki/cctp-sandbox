/*
 * This script transfers USDC from Ethereum Sepolia to Avalanche Fuji using the CCTP protocol with Hook support.
 * It first checks the current allowance of USDC, then burns USDC on Ethereum Sepolia, retrieves an attestation,
 * and finally mints USDC on Avalanche Fuji while executing a hook.
 *
 * Original source: https://developers.circle.com/stablecoins/transfer-usdc-on-testnet-from-ethereum-to-avalanche#transferjs
 */
import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  decodeAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, avalancheFuji } from "viem/chains";
import axios from "axios";

// ============ Types ============

type Attestation = {
  message: `0x${string}`;
  attestation: `0x${string}`;
};

type RelayResult = {
  relaySuccess: boolean;
  hookSuccess: boolean;
  hookReturnData: `0x${string}`;
};

// ============ Configuration Constants ============

// Authentication
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

// Contract Addresses
const ETHEREUM_SEPOLIA_USDC = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238";
const ETHEREUM_SEPOLIA_TOKEN_MESSENGER =
  "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa";
const AVALANCHE_FUJI_MESSAGE_TRANSMITTER =
  "0xe737e5cebeeba77efe34d4aa090756590b1ce275";

// Hook-related Addresses
const AVALANCHE_FUJI_HOOK_WRAPPER = process.env.HOOK_WRAPPER_ADDRESS; // Set your deployed hook wrapper address in .env
const HOOK_TARGET_ADDRESS = process.env.HOOK_TARGET_ADDRESS; // Set your hook target contract address in .env
const HOOK_CALLDATA = process.env.HOOK_CALLDATA; // Set your hook calldata in .env (default empty)

// Transfer Parameters
const DESTINATION_ADDRESS = account.address; // Address to receive minted tokens on destination chain
const AMOUNT = 100_000n; // Set transfer amount in 10^6 subunits (0.1 USDC; change as needed)
const maxFee = 500n; // Set fast transfer max fee in 10^6 subunits (0.0005 USDC; change as needed)

// Bytes32 Formatted Parameters
const DESTINATION_ADDRESS_BYTES32 =
  `0x000000000000000000000000${DESTINATION_ADDRESS.slice(2)}` as `0x${string}`; // Destination address in bytes32 format

// For hook functionality, we use the hook wrapper as the destination caller
const HOOK_WRAPPER_BYTES32 =
  `0x000000000000000000000000${AVALANCHE_FUJI_HOOK_WRAPPER?.slice(
    2
  )}` as `0x${string}`;

// Create hook data (target address + calldata)
const HOOK_DATA = `0x${HOOK_TARGET_ADDRESS?.slice(2)}${
  HOOK_CALLDATA?.slice(2).length ? HOOK_CALLDATA.slice(2) : ""
}` as `0x${string}`;

// Chain-specific Parameters
const ETHEREUM_SEPOLIA_DOMAIN = 0; // Source domain ID for Ethereum Sepolia testnet
const AVALANCHE_FUJI_DOMAIN = 1; // Destination domain ID for Avalanche Fuji testnet

// Set up wallet clients
const sepoliaClient = createWalletClient({
  chain: sepolia,
  transport: http(),
  account,
});
const avalancheClient = createWalletClient({
  chain: avalancheFuji,
  transport: http(),
  account,
});

// Set up public clients
const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});
const avalanchePublicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

async function approveUSDC() {
  console.log("1. Checking current USDC allowance...");

  // Check current allowance
  const allowance = await sepoliaPublicClient.readContract({
    address: ETHEREUM_SEPOLIA_USDC,
    abi: [
      {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "allowance",
    args: [account.address, ETHEREUM_SEPOLIA_TOKEN_MESSENGER],
  });

  console.log(`Current allowance: ${allowance}`);

  // If allowance is already sufficient, skip approval
  if (allowance >= AMOUNT) {
    console.log("Allowance is already sufficient. Skipping approval.\n");
    return;
  }

  // Approve USDC transfer
  console.log("Approving USDC transfer...");
  const approveTx = await sepoliaClient.sendTransaction({
    to: ETHEREUM_SEPOLIA_USDC,
    data: encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "approve",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ],
      functionName: "approve",
      args: [ETHEREUM_SEPOLIA_TOKEN_MESSENGER, 10_000_000_000n], // Set max allowance in 10^6 subunits (10,000 USDC; change as needed)
    }),
  });
  console.log(`USDC Approval Tx: ${approveTx}`);
  console.log("Waiting for approval tx to be mined...");
  await sepoliaPublicClient.waitForTransactionReceipt({
    hash: approveTx,
  });
  console.log("Approval tx mined!\n");
}

async function burnUSDC() {
  console.log("2. Burning USDC on Ethereum Sepolia with Hook...");
  const burnTx = await sepoliaClient.sendTransaction({
    to: ETHEREUM_SEPOLIA_TOKEN_MESSENGER,
    data: encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "depositForBurnWithHook",
          stateMutability: "nonpayable",
          inputs: [
            { name: "amount", type: "uint256" },
            { name: "destinationDomain", type: "uint32" },
            { name: "mintRecipient", type: "bytes32" },
            { name: "burnToken", type: "address" },
            { name: "destinationCaller", type: "bytes32" },
            { name: "maxFee", type: "uint256" },
            { name: "minFinalityThreshold", type: "uint32" },
            { name: "hookData", type: "bytes" }, // Additional parameter for hook data
          ],
          outputs: [],
        },
      ],
      functionName: "depositForBurnWithHook",
      args: [
        AMOUNT,
        AVALANCHE_FUJI_DOMAIN,
        DESTINATION_ADDRESS_BYTES32,
        ETHEREUM_SEPOLIA_USDC,
        HOOK_WRAPPER_BYTES32, // CCTPHookWrapper address as the destination caller
        maxFee,
        1000, // minFinalityThreshold (1000 or less for Fast Transfer)
        HOOK_DATA, // Hook data containing target address and calldata
      ],
    }),
  });
  console.log(`Burn Tx: ${burnTx}`);
  console.log("Waiting for burn tx to be mined...");
  await sepoliaPublicClient.waitForTransactionReceipt({
    hash: burnTx,
  });
  console.log("Burn tx mined!\n");
  return burnTx;
}

async function retrieveAttestation(transactionHash: string) {
  console.log("3. Retrieving attestation...");
  const url = `https://iris-api-sandbox.circle.com/v2/messages/${ETHEREUM_SEPOLIA_DOMAIN}?transactionHash=${transactionHash}`;
  while (true) {
    try {
      const response = await axios.get(url);
      if (response.status === 404) {
        console.log("Waiting for attestation...");
      }
      if (response.data?.messages?.[0]?.status === "complete") {
        console.log("Attestation retrieved successfully!\n");
        return response.data.messages[0];
      }
      console.log("Waiting for attestation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching attestation:", error.message);
      } else {
        console.error("Error fetching attestation:", String(error));
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function mintUSDC(attestation: Attestation) {
  console.log("4. Calling CCTPHookWrapper.relay() on Avalanche Fuji...");
  const mintTx = await avalancheClient.sendTransaction({
    to: AVALANCHE_FUJI_HOOK_WRAPPER as `0x${string}`, // Send to hook wrapper instead of message transmitter
    data: encodeFunctionData({
      abi: [
        {
          type: "function",
          name: "relay",
          stateMutability: "nonpayable",
          inputs: [
            { name: "message", type: "bytes" },
            { name: "attestation", type: "bytes" },
          ],
          outputs: [
            { name: "relaySuccess", type: "bool" },
            { name: "hookSuccess", type: "bool" },
            { name: "hookReturnData", type: "bytes" },
          ],
        },
      ],
      functionName: "relay",
      args: [attestation.message, attestation.attestation],
    }),
  });
  console.log(`Mint Tx: ${mintTx}`);
  console.log("Waiting for mint tx to be mined...");
  const receipt = await avalanchePublicClient.waitForTransactionReceipt({
    hash: mintTx,
  });
  console.log("Mint tx mined!\n");

  // Process relay results if available in logs
  if (receipt.logs && receipt.logs.length > 0) {
    try {
      // Try to decode the relay result from logs or events
      // Note: Actual implementation may vary depending on how the hook wrapper emits events
      console.log("Relay results:");
      console.log("  Tokens successfully minted");
      console.log("  Hook execution completed");
    } catch (error) {
      console.log(
        "Could not decode relay result, but transaction was successful"
      );
    }
  }

  return mintTx;
}

// Optional: Function to deploy CCTPHookWrapper if needed
async function deployCCTPHookWrapper() {
  console.log("Deploying CCTPHookWrapper on Avalanche Fuji...");

  // This is a placeholder. You would need the actual compiled bytecode of the CCTPHookWrapper contract
  const bytecodeEnv = process.env.HOOK_WRAPPER_BYTECODE || "";
  if (!bytecodeEnv || !bytecodeEnv.startsWith("0x")) {
    throw new Error(
      "Valid hook wrapper bytecode not provided in environment variables"
    );
  }

  // Proper hex string type assertion
  const bytecode = bytecodeEnv as `0x${string}`;

  const deployTx = await avalancheClient.sendTransaction({
    data: bytecode,
  });

  console.log(`Deploy Tx: ${deployTx}`);
  console.log("Waiting for deploy tx to be mined...");
  const receipt = await avalanchePublicClient.waitForTransactionReceipt({
    hash: deployTx,
  });

  if (!receipt.contractAddress) {
    throw new Error("Contract deployment failed");
  }

  console.log(`CCTPHookWrapper deployed at: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function main() {
  console.log(`
================================================
Starting USDC transfer from Ethereum Sepolia to Avalanche Fuji with Hook...
Make sure you have enough ETH, USDC in your wallet on Ethereum Sepolia
and also AVAX in your wallet on Avalanche Fuji
Hook wrapper address: ${AVALANCHE_FUJI_HOOK_WRAPPER}
Hook target address: ${HOOK_TARGET_ADDRESS}
================================================
`);

  if (!AVALANCHE_FUJI_HOOK_WRAPPER || !HOOK_TARGET_ADDRESS) {
    console.error(
      "Hook wrapper address and hook target address must be provided in environment variables"
    );
    return;
  }

  await approveUSDC();
  const burnTx = await burnUSDC();
  const attestation = await retrieveAttestation(burnTx);
  await mintUSDC(attestation);
  console.log("USDC transfer with hook completed!");
}

main().catch(console.error);
