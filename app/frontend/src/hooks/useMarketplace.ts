import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { useProgram } from './useProgram';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress 
} from '@solana/spl-token';

// Constants for common program addresses
const METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const SYSTEM_PROGRAM_ID = web3.SystemProgram.programId;

export interface InitializeMarketplaceParams {
  name: string;
  fee: number;
}

export interface ListingParams {
  price: number;
  nftMint: web3.PublicKey;
  collectionMint: web3.PublicKey;
}

export interface DelistParams {
  nftMint: web3.PublicKey;
}

export interface PurchaseParams {
  nftMint: web3.PublicKey;
  maker: web3.PublicKey;
}

export const useMarketplace = () => {
  const { program, provider } = useProgram();
  const wallet = useWallet();



  // Listing an NFT
  const listNft = async ({ price, nftMint, collectionMint }: ListingParams) => {
    if (!program || !provider || !wallet.publicKey) throw new Error("Program not initialized");

    // Convert price to lamports (as BN)
    const priceInLamports = new BN(price * LAMPORTS_PER_SOL);

    // Get the marketplace account (assuming name is stored somewhere or passed in)
    // For this example, assuming you've stored the marketplace name in localStorage
    const marketplaceName = localStorage.getItem('marketplaceName');
    if (!marketplaceName) throw new Error("Marketplace name not found");

    const marketplace = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplaceName)],
      program.programId
    )[0];

    // Find the listing PDA
    const listing = web3.PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), nftMint.toBuffer()],
      program.programId
    )[0];

    // Find the maker's token account for the NFT
    const makerAta = await getAssociatedTokenAddress(
      nftMint,
      wallet.publicKey
    );

    // Find the vault token account
    const vault = await getAssociatedTokenAddress(
      nftMint,
      listing,
      true // allowOwnerOffCurve
    );

    // Find metadata accounts
    const nftMetadata = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer()
      ],
      METADATA_PROGRAM_ID
    )[0];

    const nftEdition = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
        Buffer.from("edition")
      ],
      METADATA_PROGRAM_ID
    )[0];

    const tx = await program.methods
      .listing(priceInLamports.toNumber())
      .accountsPartial({
        maker: wallet.publicKey,
        marketplace,
        makerMint: nftMint,
        collectionMint,
        makerAta,
        metadata: nftMetadata,
        vault,
        masterEdition: nftEdition,
        listing,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: METADATA_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { tx, listing, vault };
  };

  // Delist an NFT
  const delistNft = async ({ nftMint }: DelistParams) => {
    if (!program || !provider || !wallet.publicKey) throw new Error("Program not initialized");

    // Get the marketplace name from localStorage
    const marketplaceName = localStorage.getItem('marketplaceName');
    if (!marketplaceName) throw new Error("Marketplace name not found");

    const marketplace = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplaceName)],
      program.programId
    )[0];

    // Find the listing PDA
    const listing = web3.PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), nftMint.toBuffer()],
      program.programId
    )[0];

    // Find the maker's token account for the NFT
    const makerAta = await getAssociatedTokenAddress(
      nftMint,
      wallet.publicKey
    );

    // Find the vault token account
    const vault = await getAssociatedTokenAddress(
      nftMint,
      listing,
      true // allowOwnerOffCurve
    );

    const tx = await program.methods
      .delist()
      .accountsPartial({
        maker: wallet.publicKey,
        marketplace,
        makerMint: nftMint,
        makerAta,
        listing,
        vault,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { tx };
  };

  // Purchase an NFT
  const purchaseNft = async ({ nftMint, maker }: PurchaseParams) => {
    if (!program || !provider || !wallet.publicKey) throw new Error("Program not initialized");

    // Get the marketplace name
    const marketplaceName = localStorage.getItem('marketplaceName') || "hack-123-x-5-3";
    if (!marketplaceName) throw new Error("Marketplace name not found");

    const marketplace = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplaceName)],
      program.programId
    )[0];

    // Find the listing PDA
    const listing = web3.PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), nftMint.toBuffer()],
      program.programId
    )[0];

    // Find the taker's token account for the NFT
    const takerAta = await getAssociatedTokenAddress(
      nftMint,
      wallet.publicKey
    );

    // Find the vault token account
    const vault = await getAssociatedTokenAddress(
      nftMint,
      listing,
      true // allowOwnerOffCurve
    );

    // Find the rewards mint
    const rewardsMint = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), marketplace.toBuffer()],
      program.programId
    )[0];

    // Find the taker's token account for rewards
    const takerAtaReward = await getAssociatedTokenAddress(
      rewardsMint,
      wallet.publicKey
    );

    // Find the treasury account
    const treasury = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketplace.toBuffer()],
      program.programId
    )[0];

    try {
      // Get a fresh blockhash first
      const connection = provider.connection;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Setup the transaction with fresh blockhash
      const methodsContext = program.methods.purchase();
      
      const tx = await methodsContext.accountsPartial({
        taker: wallet.publicKey,
        maker,
        makerMint: nftMint,
        marketplace,
        takerAta,
        takerAtaReward,
        vault,
        rewardsMint,
        listing,
        treasury,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).transaction();
      
      // Set the fresh blockhash
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;
      
      // Sign with the wallet
      const signedTx = await wallet.signTransaction?.(tx);
      if (!signedTx) throw new Error("Failed to sign transaction");
      
      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });
      
      console.log("Transaction confirmed:", signature);
      return { tx: signature };
    } catch (error) {
      console.error("Error in purchase transaction:", error);
      throw error;
    }
  };



  const listNftMutation = useMutation({
    mutationFn: listNft,
  });

  const delistNftMutation = useMutation({
    mutationFn: delistNft,
  });

  const purchaseNftMutation = useMutation({
    mutationFn: purchaseNft,
  });

  return {
    listNft: listNftMutation,
    delistNft: delistNftMutation,
    purchaseNft: purchaseNftMutation,
  };
}; 