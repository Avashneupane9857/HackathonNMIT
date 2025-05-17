'use client'

import { FC, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMarketplace } from '@/hooks/useMarketplace'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { NFT } from '@/hooks/useNfts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tilt } from './ui/tilt'
import { Spotlight } from './ui/spotlight'
import { ArrowUpRight, InfoIcon, ListFilter, Tag, Trash } from 'lucide-react'
import { motion } from 'framer-motion'

interface NftCardProps {
  nft: NFT
  onSuccess?: () => void
}

export const NftCard: FC<NftCardProps> = ({ nft, onSuccess }) => {
  const { listNft, delistNft, purchaseNft } = useMarketplace()
  const wallet = useWallet()
  const [price, setPrice] = useState(0.1)
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isOwner = nft.maker === wallet.publicKey?.toString()

  const handleList = async () => {
    if (!nft.collectionMint) {
      console.error('Collection mint is required for listing')
      return
    }

    try {
      await listNft.mutateAsync({
        price,
        nftMint: new PublicKey(nft.mint),
        collectionMint: new PublicKey(nft.collectionMint),
      })

      setShowPriceInput(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error listing NFT:', error)
    }
  }

  const handleDelist = async () => {
    try {
      await delistNft.mutateAsync({
        nftMint: new PublicKey(nft.mint),
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error delisting NFT:', error)
    }
  }

  const handlePurchase = async () => {
    if (!nft.maker) return

    try {
      await purchaseNft.mutateAsync({
        nftMint: new PublicKey(nft.mint),
        maker: new PublicKey(nft.maker),
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error purchasing NFT:', error)
    }
  }

  const truncateMint = (mint: string) => {
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`
  }

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
      <div className="relative aspect-square overflow-hidden">
        <Tilt
          rotationFactor={8}
          isRevese
          style={{ transformOrigin: 'center center' }}
          springOptions={{
            stiffness: 300,
            damping: 20,
            mass: 1,
          }}
          className="relative w-full h-full overflow-hidden"
        >
          <Spotlight
            className="z-10 from-purple-500/20 via-indigo-500/10 to-transparent blur-2xl"
            size={250}
            springOptions={{
              stiffness: 26.7,
              damping: 4.1,
              mass: 0.2,
            }}
          />

          {nft.image && !imageError ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover transition-transform duration-700 scale-100 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-800/20 to-zinc-900 flex items-center justify-center text-zinc-400">
              <div className="text-center p-4">
                <div className="mb-2 opacity-50">
                  <Tag className="h-8 w-8 mx-auto" />
                </div>
                <span className="font-mono">{nft.name || 'No Image'}</span>
              </div>
            </div>
          )}

          {nft.isListed && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="px-2 py-1 bg-purple-600/90 text-white font-mono text-xs border-none">Listed</Badge>
            </div>
          )}
        </Tilt>
      </div>

      <div className="flex flex-col p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-mono text-lg font-bold text-white line-clamp-1">{nft.name}</h3>
          {nft.symbol && (
            <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-400 font-mono text-xs">
              {nft.symbol}
            </Badge>
          )}
        </div>

        <div className="flex items-center mb-3">
          <span className="text-xs text-zinc-500 font-mono">{truncateMint(nft.mint)}</span>
        </div>

        {nft.isListed && nft.price ? (
          <div className="mt-1 mb-3">
            <span className="text-xs text-zinc-500">Current price</span>
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">{nft.price}</span>
              <span className="ml-1 text-sm font-semibold text-purple-400">SOL</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{nft.description}</p>
        )}

        {showPriceInput && (
          <div className="mt-2 mb-3">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Set price in SOL</label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        {nft.isListed ? (
          isOwner ? (
            <Button
              variant="destructive"
              onClick={handleDelist}
              disabled={delistNft.isPending}
              className="w-full bg-red-600 hover:bg-red-700 font-medium"
            >
              {delistNft.isPending ? (
                'Delisting...'
              ) : (
                <span className="flex items-center">
                  <Trash className="mr-2 h-4 w-4" />
                  Delist NFT
                </span>
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={purchaseNft.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {purchaseNft.isPending ? (
                'Processing...'
              ) : (
                <span className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Buy for {nft.price} SOL
                </span>
              )}
            </Button>
          )
        ) : showPriceInput ? (
          <div className="flex w-full space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPriceInput(false)}
              className="w-1/2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleList}
              disabled={listNft.isPending}
              className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {listNft.isPending ? 'Listing...' : 'Confirm'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setShowPriceInput(true)}
              className="w-1/2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ListFilter className="mr-2 h-4 w-4" />
              List
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-mono">{nft.name}</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    {nft.description || 'No description available'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <h3 className="font-semibold text-sm text-purple-400">Token Address</h3>
                    <p className="text-xs break-all font-mono bg-zinc-800 p-2 rounded-md">{nft.mint}</p>
                  </div>

                  {nft.collectionMint && (
                    <div className="grid gap-2">
                      <h3 className="font-semibold text-sm text-purple-400">Collection</h3>
                      <p className="text-xs break-all font-mono bg-zinc-800 p-2 rounded-md">{nft.collectionMint}</p>
                    </div>
                  )}

                  {nft.uri && (
                    <div className="grid gap-2">
                      <h3 className="font-semibold text-sm text-purple-400">Metadata URI</h3>
                      <p className="text-xs break-all font-mono bg-zinc-800 p-2 rounded-md">{nft.uri}</p>
                    </div>
                  )}

                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="grid gap-2">
                      <h3 className="font-semibold text-sm text-purple-400">Attributes</h3>
                      <div className="flex flex-wrap gap-2">
                        {nft.attributes.map((attr, i) => (
                          <div key={i} className="bg-zinc-800 p-2 rounded-md text-xs">
                            <span className="font-semibold text-purple-300">{attr.trait_type}: </span>
                            <span className="text-zinc-300">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
