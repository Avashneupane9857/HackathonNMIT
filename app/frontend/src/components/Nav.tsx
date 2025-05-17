'use client'
import { useEffect, useState } from 'react'
import { Wallet, ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletName } from '@solana/wallet-adapter-base'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PhantomNavbar() {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDisconnect = async () => {
    try {
      await wallet.disconnect()
      console.log('Wallet disconnected successfully')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleConnect = async () => {
    try {
      if (wallet.wallets && wallet.wallets.length > 0) {
        const phantomWallet = wallet.wallets.find((w) => w.adapter.name.toLowerCase() === 'phantom')
        if (phantomWallet) {
          await wallet.select(phantomWallet.adapter.name as WalletName)
          await wallet.connect()
        } else {
          console.error('Phantom wallet not found')
        }
      } else {
        await wallet.connect()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      console.log('✅ Connected to:', publicKey.toBase58())
    } else {
      console.log('❌ Wallet disconnected')
    }
  }, [connected, publicKey])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50",
        "backdrop-blur-lg bg-[#10101a]/90 border-b border-[#23243a] shadow-[0_2px_24px_0_rgba(20,20,40,0.25)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-2xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg font-sans"
            >
              <span className="animate-float">🪐</span>
              NftAI
            </Link>
          </div>

          {/* Desktop Nav */}
          {/* No navigation links as requested */}

          {/* Wallet Connect */}
          <div className="hidden md:block">
            {!connected ? (
              <Button
                onClick={handleConnect}
                className="bg-gradient-to-r cursor-pointer from-white to-gray-300 text-black font-bold shadow-md hover:scale-105 transition-transform border-0"
                style={{
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 16px 0 rgba(161,140,209,0.15)'
                }}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Phantom
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-white text-white bg-black/80 font-bold hover:bg-white/10 transition-all"
                    style={{
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 16px 0 rgba(161,140,209,0.10)'
                    }}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {publicKey?.toBase58().slice(0, 4)}...
                    {publicKey?.toBase58().slice(-4)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#24243e] border-[#a18cd1]">
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="  text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-[#a18cd1]/10"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#10101a]/95 backdrop-blur-lg border-b border-[#23243a] shadow-lg">
          <div className="px-4 pt-4 pb-4 space-y-2">
            {/* No navigation links as requested */}
          </div>
        </div>
      )}
    </nav>
  )
}
