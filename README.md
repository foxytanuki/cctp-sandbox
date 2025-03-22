# cctp-sandbox

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run ./src/transfer.ts
```

example:

```
bun run ./src/transfer.ts
================================================
Starting USDC transfer from Ethereum Sepolia to Avalanche Fuji...
Make sure you have enough ETH, USDC in your wallet on Ethereum Sepolia
and also AVAX in your wallet on Avalanche Fuji
================================================

1. Checking current USDC allowance...
Current allowance: 9999700000
Allowance is already sufficient. Skipping approval.

2. Burning USDC on Ethereum Sepolia...
Burn Tx: 0x28a4e48ba8d37f6c737dc1f4f24a2cb485ce191a888a4a6e58158f2ade861372
Waiting for burn tx to be mined...
Burn tx mined!

3. Retrieving attestation...
Waiting for attestation...
Waiting for attestation...
Waiting for attestation...
Attestation retrieved successfully!

4. Minting USDC on Avalanche Fuji...
Mint Tx: 0xad1d588272bdd9fbb49b951d3013a5ec75ffb75e1fdbd55856a92aa7e6d7104f
Waiting for mint tx to be mined...
Mint tx mined!

USDC transfer completed!
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
