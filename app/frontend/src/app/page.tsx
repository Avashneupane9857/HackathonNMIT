// import DashboardFeature from '@/components/dashboard/dashboard-feature'

// export default function Home() {
//   // return <DashboardFeature />
//   return <div>hi</div>
// }

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, ShoppingCart, TwitterIcon } from 'lucide-react'
import { containerVariants, fadeInUp, itemVariants } from '@/utils/motion'
import { AnimatedModalDemo } from '@/components/nft-update'
import { DevnetAlert } from '@/components/devnet-alert'
import { TestiMonials } from '@/components/ui/testimonial'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-black via-[#111] to-black min-h-screen text-white">
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative flex items-center justify-center overflow-hidden py-24"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 20%, rgba(80,0,255,0.15) 0%, transparent 70%)',
              zIndex: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />
          {/* Animated Blobs */}
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl top-[-6rem] left-[-6rem] animated-blob" />
          <div className="absolute w-72 h-72 bg-white/5 rounded-full blur-2xl bottom-[-6rem] right-[-6rem] animated-blob" />
          <div className="container mx-auto px-4 z-10">
            <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
              <motion.h1
                className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white drop-shadow-lg font-sans animated-gradient-text"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                The Decentralized AI Marketplace
              </motion.h1>
              <motion.p
                className="text-2xl mb-8 font-semibold tracking-tight font-mono text-white drop-shadow-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Unleash, trade, and own AI models on the world's first truly decentralized marketplace.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/marketplace">
                  <Button size="lg" className="cursor-pointer group bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-black font-bold shadow-lg hover:scale-105 transition-transform">
                    Get Started <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
                <Link href="/market">
                  <Button size="lg" variant="outline" className="cursor-pointer group border-[#a18cd1] text-white hover:bg-[#a18cd1]/10 hover:scale-105 transition-transform">
                    Explore Market{' '}
                    <ShoppingCart className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Choose Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-20 relative"
        >
          {/* Subtle animated background blobs */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-0 left-1/4 animated-blob" />
            <div className="absolute w-60 h-60 bg-white/5 rounded-full blur-2xl bottom-0 right-1/4 animated-blob" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-center mb-14 tracking-tight">
              Why Choose Our Platform?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: 'Decentralized & Trustless',
                  description: 'No middlemen. All transactions and ownership are secured on-chain, ensuring transparency and true model ownership.',
                  icon: '🛡️',
                  glow: 'from-white to-gray-300',
                },
                {
                  title: 'Empowering AI Engineers',
                  description: 'Monetize your AI expertise. List, license, and sell your models directly to a global audience of developers and businesses.',
                  icon: '🧑‍💻',
                  glow: 'from-white to-gray-400',
                },
                {
                  title: 'Open Collaboration',
                  description: 'Join a vibrant, open-source community. Discover, fork, and improve models together—fueling the next wave of AI innovation.',
                  icon: '🌐',
                  glow: 'from-white to-gray-500',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.07, boxShadow: "0 0 32px 8px #a18cd1" }}
                  className={cn(
                    "relative p-8 rounded-2xl bg-[#18192a]/80 border border-[#23243a] shadow-xl transition-all overflow-hidden group",
                    "before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300",
                    "hover:before:opacity-100"
                  )}
                  style={{
                    boxShadow: `0 4px 32px 0 rgba(161,140,209,0.10)`,
                  }}
                >
                  {/* Subtle white/gray glow on hover, plus a dark overlay for contrast */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(200,200,200,0.08))',
                      filter: 'blur(16px)'
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 group-hover:opacity-80 transition-opacity duration-300"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                  />
                  <div className="relative z-20 flex flex-col items-center">
                    <span className="text-5xl mb-4 animate-float">{feature.icon}</span>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-center">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials and CTA */}
        <TestiMonials />

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-20"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Creating?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators and collectors in our AI-powered NFT marketplace. Start creating unique
                digital art today!
              </p>
              <Link href="/mint">
                <Button size="lg" className="group bg-gradient-to-r from-[#a18cd1] to-[#fbc2eb] text-black font-bold shadow-lg hover:scale-105 transition-transform">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
          <div className="relative flex flex-col items-center justify-center mt-16 space-y-2 text-center">
            {/* Animated border and glow */}
            <div className="h-1 w-32 md:w-64 animated-border rounded-full mb-6" />
            <div className="absolute -z-10 w-[340px] md:w-[500px] h-[180px] blur-2xl bg-gradient-to-br from-white/10 via-gray-400/10 to-black/0 rounded-3xl" />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="backdrop-blur-xl bg-black/70 border border-white/10 rounded-3xl px-8 py-8 w-full max-w-xl flex flex-col items-center space-y-3 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl md:text-5xl animate-float drop-shadow-lg">🪐</span>
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-mono drop-shadow-lg">
                  NftAI
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-200">
                Built by <span className="font-bold underline underline-offset-4 text-white">Team Kraken</span>
              </p>
              <p className="text-lg text-gray-300">
                Source code:{' '}
                <a
                  href="https://github.com/Avashneupane9857/HackathonNMIT"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline underline-offset-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </p>
              <p className="text-xs text-gray-500 mt-2 tracking-wide">
                &copy; {new Date().getFullYear()} NftAI. All rights reserved.
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
