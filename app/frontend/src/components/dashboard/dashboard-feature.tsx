'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNfts } from '@/hooks/useNfts'
import { NftCard } from '@/components/NftCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'
import ClientOnly from '@/components/ClientOnly'
import { NFTMintForm } from '@/components/NFTMintForm'
import { CollectionManager } from '@/components/CollectionManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const MARKETPLACE_NAME = 'hack-123-x-5-3'

export default function DashboardFeature() {
  const wallet = useWallet()
  const { userNfts, listedNfts } = useNfts()
  const [activeTab, setActiveTab] = useState<'my-nfts' | 'marketplace' | 'mint' | 'collections'>('my-nfts')
  const [collectionMint, setCollectionMint] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('marketplaceName')) {
      localStorage.setItem('marketplaceName', MARKETPLACE_NAME)
      toast.success('Connected to Solana NFT Marketplace')
    }
  }, [])

  const handleCollectionCreated = (mint: string) => {
    setCollectionMint(mint)
    toast.success(`Collection created! Now you can mint NFTs to this collection.`)

    setActiveTab('mint')
  }

  console.log(userNfts, 'nfts are here')

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Solana NFT Marketplace</h1>
      </div>

      <ClientOnly>
        {!wallet.connected ? (
          <div className="text-center my-12 p-8 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Connect your wallet to get started</h2>
            <p className="mb-6 text-gray-600">You need to connect your Solana wallet to access the marketplace.</p>
            <ConnectWalletButton />
          </div>
        ) : (
          <>
            <Tabs
              defaultValue="my-nfts"
              value={activeTab}
              onValueChange={(value: string) =>
                setActiveTab(value as 'my-nfts' | 'marketplace' | 'mint' | 'collections')
              }
              className="mb-6"
            >
              <div className="flex justify-center gap-4 pt-6">
                {['my-nfts', 'marketplace', 'mint', 'collections'].map((key) => (
                  <Button
                    key={key}
                    variant={activeTab === key ? 'default' : 'secondary'}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`capitalize ${
                      activeTab === key
                        ? 'bg-white text-black dark:bg-white dark:text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {key.replace('-', ' ')}
                  </Button>
                ))}
              </div>

              <TabsContent value="my-nfts">
                <h2 className="text-2xl font-semibold mb-4">My NFTs</h2>

                {userNfts.isLoading ? (
                  <div className="text-center py-8">Loading your NFTs...</div>
                ) : userNfts.error ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading NFTs: {(userNfts.error as Error).message}
                  </div>
                ) : userNfts.data?.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-gray-600">You don't have any NFTs yet.</p>
                    <Button className="mt-4" onClick={() => setActiveTab('mint')} variant="outline">
                      Mint your first NFT
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userNfts.data?.map((nft) => (
                      <NftCard key={nft.mint} nft={nft} onSuccess={() => userNfts.refetch()} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="marketplace">
                <h2 className="text-2xl font-semibold mb-4">Marketplace</h2>

                {listedNfts.isLoading ? (
                  <div className="text-center py-8">Loading marketplace...</div>
                ) : listedNfts.error ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading marketplace: {(listedNfts.error as Error).message}
                  </div>
                ) : listedNfts.data?.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-gray-600">No NFTs listed in the marketplace yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listedNfts.data?.map((nft) => (
                      <NftCard key={nft.mint} nft={nft} onSuccess={() => listedNfts.refetch()} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mint">
                <h2 className="text-2xl font-semibold mb-4">Create New NFT</h2>
                {collectionMint && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 text-sm">
                      Using collection: {collectionMint.slice(0, 8)}...{collectionMint.slice(-8)}
                    </p>
                  </div>
                )}
                <div className="max-w-md mx-auto">
                  <NFTMintForm
                    onSuccess={() => {
                      userNfts.refetch()
                      setActiveTab('my-nfts')
                    }}
                    collectionMint={collectionMint || undefined}
                  />
                </div>
              </TabsContent>

              <TabsContent value="collections">
                <h2 className="text-2xl font-semibold mb-4">Manage Collections</h2>
                <div className="max-w-md mx-auto">
                  <CollectionManager onSuccess={handleCollectionCreated} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </ClientOnly>
    </main>
  )
}
