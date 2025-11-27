# Vaultana - The Vault That Probably Works

A Solana vault for the true degens. It locks your bags away from your paper hands (verify, don't trust), keeps them safe from your own bad decisions, and lets you withdraw when you inevitably need liquidity to ape into the next rug.

## Features

- **Initialize Vault**: Creates a secure PDA-controlled vault for your specific SPL token mint.
- **Deposit**: Send your hard-earned (or faucet-minted) tokens into the vault.
- **Withdraw**: Get your tokens back. No lockups, no staking rewards, just a box for your coins.
- **Type Safe**: Written in TypeScript because we like our errors at compile time, not runtime.

## Prerequisites

- Node.js (v16+)
- Anchor CLI
- Solana CLI (configured for Devnet)
- A wallet with some SOL (for rent and gas)

## Installation

```bash
git clone <repo-url>
cd Vaultana
npm install
```

## Configuration

Ensure your `Anchor.toml` is pointed at the correct cluster (Devnet recommended unless you're feeling brave).
Your wallet should be configured in `~/.config/solana/id.json` or wherever Anchor looks for it.

## Usage

All scripts are in the `scripts/` folder. You can run them using `ts-node`.

### 1. Initialize the Vault
First, you need to tell the program to create a vault for your specific token mint.

```bash
npx ts-node scripts/initialize.ts <MINT_ADDRESS>
```

### 2. Deposit Tokens
Put some tokens in.

```bash
npx ts-node scripts/deposit.ts <MINT_ADDRESS> <AMOUNT>
```
*Note: Amount is in raw units (e.g., if decimals=6, 1000000 = 1 token).*

### 3. Withdraw Tokens
Take them out.

```bash
npx ts-node scripts/withdraw.ts <MINT_ADDRESS> <AMOUNT>
```

## Project Structure

```
Vaultana/
├── programs/
│   └── vaultana/       # The Rust smart contract
├── scripts/
│   ├── initialize.ts   # Sets up the vault state
│   ├── deposit.ts      # Moves tokens from you to vault
│   └── withdraw.ts     # Moves tokens from vault to you
├── tests/              # Anchor tests
└── Anchor.toml         # Configuration
```

## Deployment & Testing

We've already taken this for a spin on Devnet. Here are the receipts:

- **Program ID**: `AZWo7inNyu6C2azLZJ599ffTWSJYRkkx5aJSV2quh1tU`
- **Owner Wallet**: `EwU9CG19f5nKbf5ykk9sQZs87fdaJB5T54CKQ2K67xhA`
- **Token Mint**: `9cF23DAd59mytYTRtEGUHaRMcyYbh9gapByB1f6EvqHR`
- **Vault State PDA**: `C8JHrRGbmTVhgFhfBxohuvLsFyWmqWV25r9gwdYhsMJL`
- **Vault ATA**: `9nxhk1wJesJ9m2YCeE9DGCPT66r4y3qMBYtqDsYu32Hc`
- **User ATA**: `EWCNeeqjKc7WZ77x9DGM138wetQvNGyoPYatWrtqNYzw`

### Transactions
- **Deposit**: `536hQRwTBu56cwdkat35WXKkyMfThkzrAarP4ddhUm42BkpuBee75tCBfr6YDaZfnFCJV98TgaFJ9GyaBoguCKp5`
- **Withdrawal**: `5xchsmoVPNsqzRh6jjNZXCu4Y8yyKtorwHQa2wdohCRvsoZ3iTCcyP2MmH2nvFdc9an8Lamxn9FoyetJs1j8LHEu`

## Disclaimer

This code is provided "as is". If you lock your life savings in a devnet vault, that's on you.
