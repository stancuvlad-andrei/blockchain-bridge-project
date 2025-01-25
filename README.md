# Ethereum-Sui Token Bridge

This project is a web application that facilitates token transfers between Ethereum and Sui blockchains. It uses Anvil for Ethereum and the Sui CLI for Sui, with smart contracts deployed on both chains to handle the bridging process.

## Features
- **Two-Chain Support:** Bridge tokens between Ethereum and Sui.
- **React + Vite Frontend:** A modern and responsive web interface.
- **Tailwind CSS:** Styled with Tailwind for a sleek and minimal design.
- **Custom BCS Implementation:** Binary Canonical Serialization (BCS) is implemented manually for interacting with Sui.

## Technologies Used
- **Ethereum:**
  - [Anvil](https://book.getfoundry.sh/anvil/) for a local Ethereum development node.
  - Smart contracts written in Solidity.
- **Sui Blockchain:**
  - [Sui CLI](https://docs.sui.io/) for running a local Sui node and managing transactions.
  - Smart contracts written in Move.
- **Frontend:**
  - [React](https://react.dev/) + [Vite](https://vitejs.dev/) for building the application.
  - [Tailwind CSS](https://tailwindcss.com/) for styling.
- **Libraries:**
  - `ethers.js` for Ethereum interactions.
  - `@mysten/sui.js` for Sui interactions.
  - Various utility libraries, as required during development.

## Setup Instructions

1. **Prepare Your Environment**
   - Ensure you have Node.js, npm, and Git installed.
   - Install [Anvil](https://book.getfoundry.sh/getting-started/installation.html) for Ethereum.
   - Install the [Sui CLI](https://docs.sui.io/install) and set up a local Sui client.

2. **Run Anvil and Sui Nodes**
   - Start an Anvil node:
     ```bash
     anvil
     ```
   - Start the Sui client:
     ```bash
     sui start
     ```

3. **Set Up the Project**
   - Clone the repository:
     ```bash
     git clone <repository-url>
     cd <repository-folder>
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Configure Environment Variables**
   - Add the necessary configuration values (e.g., Ethereum and Sui RPC URLs, private keys, etc.).

5. **Start the Application**
   - Run the development server:
     ```bash
     npm run dev
     ```
   - Open the application in your browser.

## Smart Contract Deployment
- Deploy the Ethereum smart contract:
```bash
  forge create --rpc-url http://127.0.0.1:8545 --private-key <PRIVATE_KEY> <CONTRACT_PATH>

  ```
- Deploy the Sui Move module using the Sui CLI:
  ```bash
  sui move publish --gas-budget <amount>
  ```

## Notes
- Ensure that your local Anvil and Sui nodes are running before attempting to bridge tokens.
- The application will guide you to install any additional dependencies or tools needed during setup.