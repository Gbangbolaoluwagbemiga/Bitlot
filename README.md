# 🎰 BitLot

BitLot is a decentralized lottery application built on the Stacks blockchain. It allows users to spin a wheel for a chance to win items by paying a small fee in STX. The application leverages **Hiro Chainhooks** to react to on-chain events in real-time, providing an interactive and responsive user experience.

## 🚀 Features

-   **Decentralized Lottery**: Logic runs entirely on a Clarity smart contract.
-   **Real-time Updates**: Uses Chainhooks to listen for `spin-result` events and update the UI instantly.
-   **Interactive UI**: Next.js frontend with a visual spinner animation.
-   **Stacks Integration**: Seamless wallet connection and transaction signing using Stacks Connect.

## 🛠 Tech Stack

-   **Smart Contract**: Clarity (v2.5)
-   **Frontend**: Next.js, TypeScript, Tailwind CSS
-   **Blockchain Interaction**: Stacks.js (@stacks/connect, @stacks/network)
-   **Indexer/Events**: Hiro Chainhooks

## 🔗 Contract Details (Mainnet)

The smart contract is deployed on the Stacks Mainnet.

-   **Contract Address**: `SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP`
-   **Contract Name**: `bitlot`
-   **Function**: `play` (Cost: 1 STX)

## 📦 Project Structure

```bash
BitLot/
├── bitlot-contract/     # Clarity smart contract project (Clarinet)
│   ├── contracts/       # Contract source code
│   └── settings/        # Network configurations
├── bitlot-web/          # Next.js Frontend application
│   ├── components/      # UI Components (Spinner)
│   └── lib/             # Stacks.js configuration
├── Chainhook.toml       # Chainhook event configuration
└── README.md            # Documentation
```

## 🏁 Getting Started

### Prerequisites

-   Node.js (v18+)
-   [Clarinet](https://github.com/hirosystems/clarinet) (for local contract development)
-   Stacks Wallet (Leather or Xverse)

### 1. Smart Contract (Local Dev)

To run the contract locally or run tests:

```bash
cd bitlot-contract
clarinet check
clarinet test
```

### 2. Frontend Setup

The frontend is configured to run on Mainnet by default but can be switched to Devnet/Testnet via environment variables.

```bash
cd bitlot-web
npm install
```

**Environment Setup:**
Create a `.env.local` file in `bitlot-web/`:

```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP
NEXT_PUBLIC_CONTRACT_NAME=bitlot
```

**Run the App:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎲 How to Play

1.  Connect your Stacks Wallet (ensure you are on Mainnet).
2.  Click the **SPIN (1 STX)** button.
3.  Confirm the transaction in your wallet.
4.  Wait for the transaction to confirm on the blockchain.
5.  The spinner will stop on your result!

## 🪝 Chainhook Setup

To enable real-time event listening:

1.  Register the predicate defined in `Chainhook.toml` with the Hiro Platform or a local Chainhook node.
2.  Ensure your `bitlot-web` API route (`/api/chainhook`) is publicly accessible (e.g., using ngrok for local dev).

```bash
# Example local chainhook run (requires chainhook binary)
chainhook predicate register --config Chainhook.toml --network mainnet
```
