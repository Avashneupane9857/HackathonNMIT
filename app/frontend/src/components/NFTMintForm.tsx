'use client'

import { FC, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMintNft } from '@/hooks/useMintNft'
import { Textarea } from '@/components/ui/textarea'
import { downloadZipFromIpfs, getFromIPFS, uploadFile } from '@/utils/ipfs'

interface MintNFTFormProps {
  onSuccess?: () => void
  collectionMint?: string
}

export const NFTMintForm: FC<MintNFTFormProps> = ({ onSuccess, collectionMint }) => {
  const wallet = useWallet()
  const [status, setStatus] = useState('')
  const [ipfsURI, setIpfsURI] = useState('')
  const { mintNft } = useMintNft()
  const [formData, setFormData] = useState({
    name: '',
    symbol: 'NFT',
    description: '',
    image: '',
    sellerFee: 5,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle seller fee as a number
    if (name === 'sellerFee') {
      const numValue = Math.min(100, Math.max(0, Number(value) || 0))
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    mintNft.mutate({
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.image || undefined, // Only pass if not empty
      sellerFeeBasisPoints: formData.sellerFee,
      collectionMint: collectionMint, // Pass the collection mint if provided
    })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('Uploading model to IPFS...')
    try {
      //   const client = makeStorageClient();
      //   const cid = await client.put([file]);
      //   const uri = `ipfs://${cid}/${file.name}`;
      //   setIpfsURI(uri);
      const cid = await uploadFile(file)
      console.log(cid, 'is here')

      const uri = `ipfs://${cid}`
      console.log(uri, 'uri is here')
      const output = await downloadZipFromIpfs(uri)
      console.log(output, 'output is here')

      setIpfsURI(uri)
      setStatus('File uploaded to IPFS successfully.')
    } catch (error) {
      console.error(error)
      setStatus('IPFS upload failed.')
    }
  }

  if (!wallet.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mint New NFT</CardTitle>
          <CardDescription>Connect your wallet to mint NFTs</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint New NFT</CardTitle>
        <CardDescription>
          {collectionMint ? 'Create a new NFT in your collection' : 'Create your own NFT on Solana'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="NFT Name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="modelFile">
              Upload Model File
            </label>
            <input
              id="modelFile"
              type="file"
              accept=".pt,.onnx,.pkl,.zip"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="ipfsUri">
              Model IPFS URI
            </label>
            <input
              id="ipfsUri"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="ipfs://..."
              value={ipfsURI}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="NFT"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your NFT"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerFee">Royalty (%)</Label>
            <Input
              id="sellerFee"
              name="sellerFee"
              type="number"
              min="0"
              max="100"
              value={formData.sellerFee}
              onChange={handleChange}
              placeholder="5"
            />
            <p className="text-xs text-gray-500">Percentage fee you earn on secondary sales (0-100%)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.png"
            />
            <p className="text-xs text-gray-500">Enter a URL to your image or leave empty to generate a random image</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={mintNft.isPending}>
            {mintNft.isPending ? 'Minting...' : 'Mint NFT'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
