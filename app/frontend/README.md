# Solana NFT Marketplace

A complete NFT marketplace built on Solana blockchain with modern web technologies.

## Features

- **Connect Wallet**: Seamlessly connect your Solana wallet
- **Browse NFTs**: View all listed NFTs in the marketplace
- **Mint NFTs**: Create your own NFTs with custom metadata
- **Create Collections**: Organize your NFTs into collections
- **List/Delist**: List your NFTs for sale or remove them from the marketplace
- **Buy/Sell**: Purchase NFTs listed by other users

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Web3**: Solana Web3.js, Anchor, Metaplex SDK (UMI)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn UI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/components` - React components
- `src/hooks` - Custom React hooks for Solana integration
- `src/app` - Next.js app router pages
- `src/lib` - Utility functions and shared logic

## Solana Program

This frontend connects to a Solana program with the following ID:
`711gctwBN1aGqzRhQbDD3qiescrzg4m9Zjj1ZGndLDis`

The program supports the following instructions:
- `initialize` - Initialize a new marketplace
- `listing` - List an NFT for sale
- `delist` - Remove an NFT from sale
- `purchase` - Buy an NFT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
