"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PortfolioDashboard from '../../components/PortfolioDashboard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function PortfolioPage() {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Navigation */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="py-8">
        <PortfolioDashboard />
      </main>
    </div>
  );
} 