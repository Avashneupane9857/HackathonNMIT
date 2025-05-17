import { useMutation } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  createNft, 
  findMasterEditionPda, 
  findMetadataPda, 
  mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';

import { 
  createSignerFromKeypair, 
  generateSigner, 
  keypairIdentity, 
  publicKey,
  percentAmount
} from '@metaplex-foundation/umi';

import { toast } from 'sonner';

// Fixed collection mint address that matches our tests
// This would be replaced with your actual collection mint in production
const DEFAULT_COLLECTION_MINT = '9MynHsZQYpFFpQSLpQUEzpJoVt4UqJdvQosQpgXRTPzS';

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

  const mintNft = async (params: MintNftParams) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or doesn't support signing");
    }

    // Create a Umi instance connected to the cluster
    const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    const umi = createUmi(endpoint);
    
    // Import the wallet adapter as a Umi signer
    const walletAdapter = {
      publicKey: wallet.publicKey.toBytes(),
      signTransaction: async (transaction: any) => {
        const signedTx = await wallet.signTransaction!(transaction);
        return signedTx;
      },
      signAllTransactions: async (transactions: any[]) => {
        const signedTxs = await wallet.signAllTransactions!(transactions);
        return signedTxs;
      },
    };
    
    try {
      // Generate new mint keypair
      const nftMint = generateSigner(umi);
      
      // Set up Umi identity
      const walletSigner = createSignerFromKeypair(umi, walletAdapter as any);
      umi.use(keypairIdentity(walletSigner));
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
      };
      
      // Use the collection mint from params or the default one
      const collectionMintAddress = params.collectionMint || DEFAULT_COLLECTION_MINT;
      
      // Add collection details
      nftParams.collection = {
        verified: false,
        key: publicKey(collectionMintAddress)
      };
      
      console.log('Creating NFT with params:', {
        ...nftParams,
        mint: nftMint.publicKey.toString(),
        sellerFeeBasisPoints: sellerFee.basisPoints.toString(),
        collection: {
          ...nftParams.collection,
          key: collectionMintAddress
        }
      });
      
      // Create the NFT
      const result = await createNft(umi, nftParams).sendAndConfirm(umi);
      
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
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };

  const mintNftMutation = useMutation({
    mutationFn: mintNft,
    onSuccess: (data) => {
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
  // For this example, we'll return a placeholder URI
  return `https://arweave.net/placeholder/${name.replace(/\s+/g, '-').toLowerCase()}`;
}

// Helper function to get a random image URL
function getRandomImageUrl(name: string): string {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/300/300`;
} 