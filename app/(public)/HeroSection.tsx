'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

const easeOut = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]

export default function HeroSection() {
  const trustItems = ['Secure Payments', 'Verified Engineers', '100% Original Plans', '24/7 Support']

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0B] via-[#111111] to-[#0B0B0B]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <Zap size={14} className="fill-current" />
          Africa&apos;s #1 Architecture Marketplace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: easeOut }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Find, Buy & Build
          <br />
          <span className="text-gold-gradient">Your Dream Home</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: easeOut }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Browse premium architectural house plans, purchase professional blueprints, and hire certified engineers for your construction project — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34, ease: easeOut }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/marketplace">
            <Button variant="gold" size="xl" className="group">
              Browse Plans
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/register?role=engineer">
            <Button variant="outline" size="xl">
              Sell Your Plans
            </Button>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.46 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          {trustItems.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07, ease: easeOut }}
              className="flex items-center gap-1.5"
            >
              <CheckCircle size={14} className="text-[#D4AF37]" />
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
