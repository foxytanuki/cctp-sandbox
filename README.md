# cctp-sandbox


## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

don't forget to add your private key and make sure your address have enough ETH, USDC in your wallet on Ethereum Sepolia
and also AVAX in your wallet on Avalanche Fuji.

3. Run scripts like the below


### Run scripts

#### Cross-chain transfer

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

#### Cross-chain transfer with Hook

```bash
bun run ./src/transferWithHook.ts
```

example:

```
bun run ./src/transferWithHook.ts

================================================
Starting USDC transfer from Ethereum Sepolia to Avalanche Fuji with Hook...
Make sure you have enough ETH, USDC in your wallet on Ethereum Sepolia
and also AVAX in your wallet on Avalanche Fuji
Hook wrapper address: 0x38404A0Ab62E635b8d675aFca83f8e29029B81Cd
Hook target address: 0xa8A5CCcEf6E13A0679E2c5482f025179601F9c28
================================================

1. Checking current USDC allowance...
Current allowance: 9999500000
Allowance is already sufficient. Skipping approval.

2. Burning USDC on Ethereum Sepolia with Hook...
Burn Tx: 0x887d1497d1ae43e6ce356ca1309da587e7adedd42dbeb913a0d983cfac9d6ceb
Waiting for burn tx to be mined...
Burn tx mined!

3. Retrieving attestation...
Waiting for attestation...
Waiting for attestation...
Waiting for attestation...
Attestation retrieved successfully!

4. Calling CCTPHookWrapper.relay() on Avalanche Fuji...
Mint Tx: 0xf34379809506fd17488d24546ab1e5b642ae39cd0ddfe854709f50b67ad07f80
Waiting for mint tx to be mined...
Mint tx mined!

Relay results:
  Tokens successfully minted
  Hook execution completed
USDC transfer with hook completed!
```

## Hardhat task

### selector

```
bun x hardhat selector "processTransfer(uint256)"

# Output
Selector for processTransfer(uint256): 0x84159b60
```

## Deployed Contract

### Avalanche Fuji

| contract name | address |
| --- | --- |
| Message Transmitter *1 | 0xe737e5cebeeba77efe34d4aa090756590b1ce275 |
| Hook Wrapper | 0x38404A0Ab62E635b8d675aFca83f8e29029B81Cd |
| Hook Target | 0xa8A5CCcEf6E13A0679E2c5482f025179601F9c28 |


*1. deployed by Circle

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
