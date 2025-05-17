'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import React from 'react'
import WalletModalProviders from '@/provider/WalletProvider'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <WalletModalProviders>
          <SolanaProvider>{children}</SolanaProvider>
        </WalletModalProviders>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
