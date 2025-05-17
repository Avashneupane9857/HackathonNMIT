'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/hooks/useMarketplace';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT } from '@/hooks/useNfts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface NftCardProps {
  nft: NFT;
  onSuccess?: () => void;
}

export const NftCard: FC<NftCardProps> = ({ nft, onSuccess }) => {
  const { listNft, delistNft, purchaseNft } = useMarketplace();
  const wallet = useWallet();
  const [price, setPrice] = useState(0.1); // Default price in SOL
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isOwner = nft.maker === wallet.publicKey?.toString();
  
  const handleList = async () => {
    if (!nft.collectionMint) {
      console.error("Collection mint is required for listing");
      return;
    }
    
    try {
      await listNft.mutateAsync({
        price,
        nftMint: new PublicKey(nft.mint),
        collectionMint: new PublicKey(nft.collectionMint)
      });
      
      setShowPriceInput(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error listing NFT:", error);
    }
  };
  
  const handleDelist = async () => {
    try {
      await delistNft.mutateAsync({
        nftMint: new PublicKey(nft.mint)
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error delisting NFT:", error);
    }
  };
  
  const handlePurchase = async () => {
    if (!nft.maker) return;
    
    try {
      await purchaseNft.mutateAsync({
        nftMint: new PublicKey(nft.mint),
        maker: new PublicKey(nft.maker)
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
    }
  };

  // Truncate mint address for display
  const truncateMint = (mint: string) => {
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square">
        {nft.image && !imageError ? (
          <Image 
            src={nft.image} 
            alt={nft.name} 
            fill 
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            {nft.name || "No Image"}
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{nft.name}</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{truncateMint(nft.mint)}</span>
          {nft.symbol && <Badge variant="outline">{nft.symbol}</Badge>}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        {nft.isListed && nft.price && (
          <div className="font-semibold text-lg">
            {nft.price} SOL
          </div>
        )}
        
        {nft.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {nft.description}
          </p>
        )}
        
        {showPriceInput && (
          <div className="mt-2">
            <label className="block text-sm mb-1">Price in SOL</label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-2">
        {nft.isListed ? (
          isOwner ? (
            <Button 
              variant="destructive" 
              onClick={handleDelist}
              disabled={delistNft.isPending}
              className="w-full"
            >
              {delistNft.isPending ? 'Delisting...' : 'Delist'}
            </Button>
          ) : (
            <Button 
              onClick={handlePurchase}
              disabled={purchaseNft.isPending}
              className="w-full"
            >
              {purchaseNft.isPending ? 'Buying...' : 'Buy Now'}
            </Button>
          )
        ) : (
          showPriceInput ? (
            <div className="flex w-full space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPriceInput(false)}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleList}
                disabled={listNft.isPending}
                className="w-1/2"
              >
                {listNft.isPending ? 'Listing...' : 'Confirm'}
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowPriceInput(true)}
                className="w-1/2"
              >
                List for Sale
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="w-1/2"
                  >
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{nft.name}</DialogTitle>
                    <DialogDescription>
                      {nft.description || "No description available"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <h3 className="font-semibold text-sm">Token Address</h3>
                      <p className="text-xs break-all">{nft.mint}</p>
                    </div>
                    
                    {nft.collectionMint && (
                      <div className="grid gap-2">
                        <h3 className="font-semibold text-sm">Collection</h3>
                        <p className="text-xs break-all">{nft.collectionMint}</p>
                      </div>
                    )}
                    
                    {nft.uri && (
                      <div className="grid gap-2">
                        <h3 className="font-semibold text-sm">Metadata URI</h3>
                        <p className="text-xs break-all">{nft.uri}</p>
                      </div>
                    )}
                    
                    {nft.attributes && nft.attributes.length > 0 && (
                      <div className="grid gap-2">
                        <h3 className="font-semibold text-sm">Attributes</h3>
                        <div className="flex flex-wrap gap-2">
                          {nft.attributes.map((attr, i) => (
                            <div key={i} className="bg-secondary p-2 rounded-md text-xs">
                              <span className="font-semibold">{attr.trait_type}: </span>
                              <span>{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )
        )}
      </CardFooter>
    </Card>
  );
}; 