import { useMutation } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  createNft, 
  findMasterEditionPda, 
  findMetadataPda, 
  mplTokenMetadata,
  verifySizedCollectionItem,
  verifyCollection
} from '@metaplex-foundation/mpl-token-metadata';

import { 
  createSignerFromKeypair, 
  generateSigner, 
  keypairIdentity, 
  publicKey,
  percentAmount
} from '@metaplex-foundation/umi';

// Import the renamed function
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';

// Import this for wallet adapter integration with UMI
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';

import { toast } from 'sonner';

import { useCollectionManager } from './useCollectionManager';

export interface MintNftParams {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  sellerFeeBasisPoints?: number;
  collectionMint?: string;
}

export const useMintNft = () => {
  const wallet = useWallet();
  const { getUserCollection, currentCollection } = useCollectionManager();

  const mintNft = async (params: MintNftParams) => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.connected) {
      throw new Error("Wallet not connected or doesn't support signing");
    }

    // Create a Umi instance connected to the cluster
    const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    const umi = createUmi(endpoint);
    
    try {
      // Add a check to ensure the wallet is still connected
      if (!wallet.connected) {
        throw new Error("Wallet disconnected during operation");
      }
      
      // Get or create the user's collection
      let collectionMintAddress = params.collectionMint;
      
      // If no collection mint was provided in the params, and we don't already have
      // a collection from the currentCollection query, create a new one
      if (!collectionMintAddress) {
        if (currentCollection?.mint) {
          // Use the existing collection from the query
          collectionMintAddress = currentCollection.mint;
          console.log('✅ Using existing collection from query:', collectionMintAddress);
        } else {
          // Create or fetch a collection for this user
          const collectionResult = await getUserCollection.mutateAsync({
            name: params.name || "My NFT Collection",
            symbol: params.symbol || "COLL",
            description: params.description || "My NFT Collection",
            image: params.image,
            sellerFeeBasisPoints: params.sellerFeeBasisPoints
          });
          
          collectionMintAddress = collectionResult.mint;
          console.log('✅ Using collection:', collectionMintAddress, collectionResult.isNew ? '(newly created)' : '(existing)');
        }
      }
      
      // Generate new mint keypair
      const nftMint = generateSigner(umi);
      
      // Use wallet adapter identity directly
      umi.use(walletAdapterIdentity(wallet));
      umi.use(mplTokenMetadata());
      
      // Generate a default image if none provided
      const imageUrl = params.image || getRandomImageUrl(params.name || 'NFT');
      
      // Use percentAmount to convert the seller fee basis points
      const sellerFee = percentAmount(params.sellerFeeBasisPoints || 5.5);
      
      // Prepare the NFT creation parameters
      const nftParams: any = {
        mint: nftMint,
        name: params.name,
        symbol: params.symbol,
        uri: createMetadataUri(params.name, params.description, imageUrl),
        sellerFeeBasisPoints: sellerFee,
        collection: { verified: false, key: publicKey(collectionMintAddress) },
        // Use the wallet's public key directly
        tokenOwner: umi.identity.publicKey,
        creators: [{
          address: umi.identity.publicKey,
          verified: true,
          share: 100,
        }],
      };
      
      console.log('Creating NFT with params:', {
        ...nftParams,
        mint: nftMint.publicKey.toString(),
        sellerFeeBasisPoints: sellerFee.basisPoints.toString(),
        collection: {
          ...nftParams.collection,
          key: collectionMintAddress
        },
        creators: nftParams.creators.map((c: any) => ({
          ...c,
          address: c.address.toString()
        }))
      });
      
      // Create the NFT
      const result = await createNft(umi, nftParams).sendAndConfirm(umi);
      
      console.log("NFT created successfully:", result.signature.toString());
      
      // Verify collection for the NFT
      const collectionMetadata = findMetadataPda(umi, {
        mint: umiPublicKey(collectionMintAddress),
      });
      const collectionMasterEdition = findMasterEditionPda(umi, {
        mint: umiPublicKey(collectionMintAddress),
      });
      const nftMetadata = findMetadataPda(umi, { mint: nftMint.publicKey });
      
      try {
        // First, try verifySizedCollectionItem which is for sized collections (V1)
        await verifySizedCollectionItem(umi, {
          metadata: nftMetadata,
          collectionAuthority: umi.identity,
          collectionMint: umiPublicKey(collectionMintAddress),
          collection: collectionMetadata,
          collectionMasterEditionAccount: collectionMasterEdition,
        }).sendAndConfirm(umi);
        console.log("✅ Collection NFT Verified!");
        
      } catch (error) {
        console.error("Error verifying sized collection:", error);
        console.error("Details:", {
          wallet: wallet.publicKey.toString(),
          nftMetadata: nftMetadata.toString(),
          collectionMint: collectionMintAddress
        });
        
        // If that fails, try the standard verification
        try {
          await verifyCollection(umi, {
            metadata: nftMetadata,
            collectionAuthority: umi.identity,
            collectionMint: umiPublicKey(collectionMintAddress),
            collection: collectionMetadata, 
            collectionMasterEditionAccount: collectionMasterEdition,
          }).sendAndConfirm(umi);
          console.log("✅ Collection verified using alternate method!");
        } catch (fallbackError) {
          console.error("Fallback verification failed too:", fallbackError);
        }
      }

      return {
        mint: nftMint.publicKey.toString(),
        transactionSignature: result.signature.toString(),
        metadata: {
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          image: imageUrl,
          collectionMint: collectionMintAddress
        }
      };
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      
      // Provide more specific error messages
      if (error.message && error.message.includes('disconnected port')) {
        throw new Error('Wallet connection lost. Please reconnect your wallet and try again.');
      } else if (error.message && error.message.includes('IncorrectOwner')) {
        throw new Error('You do not have authority over the collection. Please use a different collection mint.');
      } else {
        throw error;
      }
    }
  };

  const mintNftMutation = useMutation({
    mutationFn: mintNft,
    onSuccess: (data) => {
      console.log('NFT minted successfully!', data);
      toast.success(`NFT minted successfully! Mint: ${data.mint.slice(0, 8)}...`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to mint NFT: ${error.message}`);
    }
  });

  return {
    mintNft: mintNftMutation
  };
};

// Helper function to create a metadata URI (would be replaced with real IPFS/Arweave upload)
function createMetadataUri(name: string, description: string, image: string): string {
  // In a real implementation, this would upload metadata to IPFS or Arweave
  return "https://sidd-metadata.s3.ap-south-1.amazonaws.com/metadata-1742751740128.json";
}

// Helper function to get a random image URL
function getRandomImageUrl(name: string): string {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/300/300`;
} 