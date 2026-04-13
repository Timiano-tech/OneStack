'use client';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

interface PremiumBadgeProps {
  tier?: 'pro' | 'business';
  size?: 'sm' | 'md';
}

export function PremiumBadge({ tier = 'pro', size = 'md' }: PremiumBadgeProps) {
  const isBusiness = tier === 'business';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider text-white shadow-sm ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{
        background: isBusiness 
          ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' 
          : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        boxShadow: isBusiness ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 8px rgba(245,158,11,0.3)'
      }}
    >
      <FiZap size={size === 'sm' ? 8 : 10} fill="currentColor" />
      {tier}
    </motion.div>
  );
}
