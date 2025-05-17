'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/hooks/useMarketplace';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT } from '@/hooks/useNfts';
import { Badge } from '@/components/ui/badge';
import { DownloadIcon, Info } from 'lucide-react';
import { downloadZipFromIpfs } from '@/utils/ipfs';
import { toast } from 'sonner';

interface NftCardProps {
  nft: NFT;
  onSuccess?: () => void;
}

export const NftCard: FC<NftCardProps> = ({ nft, onSuccess }) => {
  const { listNft, delistNft, purchaseNft } = useMarketplace();
  const wallet = useWallet();
  const [price, setPrice] = useState(0.1);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [modelFileUrl, setModelFileUrl] = useState<string | null>(null);

  const isOwner = nft.maker === wallet.publicKey?.toString();

  useEffect(() => {
    if (wallet.publicKey) {
      if (isOwner) setIsOwned(true);
      else if (nft.owner === wallet.publicKey.toString()) setIsOwned(true);
    }
  }, [wallet.publicKey, nft, isOwner]);

  useEffect(() => {
    if (nft.attributes) {
      const modelWeightAttr = nft.attributes.find(attr =>
        attr.trait_type === 'Model Weights CID' ||
        attr.trait_type === 'animation_url'
      );
      if (modelWeightAttr?.value) {
        if (typeof modelWeightAttr.value === 'string' &&
          (modelWeightAttr.value.startsWith('http') || modelWeightAttr.value.startsWith('ipfs'))) {
          setModelFileUrl(modelWeightAttr.value);
        } else if (typeof modelWeightAttr.value === 'string') {
          setModelFileUrl(`https://ipfs.io/ipfs/${modelWeightAttr.value.replace('ipfs://', '')}`);
        }
      }
    }
    if (nft.animation_url) setModelFileUrl(nft.animation_url);
  }, [nft]);

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
  const truncateMint = (mint: string) => `${mint.slice(0, 4)}...${mint.slice(-4)}`;

  // Status badge logic
  const status = nft.isListed
    ? (nft.sold ? 'Sold' : 'Available')
    : (nft.sold ? 'Sold' : 'Available');
  const statusColor = status === 'Available' ? 'bg-green-500' : 'bg-red-500';

  return (
    <Card className="rounded-2xl bg-black/70 border border-white/10 shadow-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200">
      <div className="relative w-full aspect-square bg-black/30">
        {nft.image && !imageError ? (
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className="object-cover rounded-t-2xl"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-900 rounded-t-2xl">
            {nft.name || "No Image"}
          </div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow ${statusColor}`}>
          {status}
        </span>
      </div>
      <CardContent className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg truncate">{nft.name}</h3>
          {nft.symbol && (
            <span className="ml-2 text-xs font-semibold bg-gray-800/80 text-gray-300 px-2 py-1 rounded">
              {nft.symbol}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-2 truncate">{nft.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-gray-400">Price</span>
            <div className="font-bold text-lg text-green-400">{nft.price} <span className="text-xs">SOL</span></div>
          </div>
          {status === 'Available' ? (
            <Button
              size="sm"
              className="bg-white/10 text-white border border-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={handlePurchase}
              disabled={purchaseNft.isPending}
            >
              <Info className="w-4 h-4" />
              Buy
            </Button>
          ) : (
            <span className="bg-yellow-500/90 text-black text-xs font-bold px-3 py-1 rounded-lg">
              {truncateMint(nft.mint)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};