'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZap, FiCheck } from 'react-icons/fi';
import { modalVariants, sheetVariants, backdropVariants } from '../../lib/animations';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    description: 'Get started on campus',
    features: [
      'Up to 5 active listings',
      'Basic messaging',
      'Social feed access',
      'Campus-only visibility',
    ],
    cta: 'Current plan',
    disabled: true,
    style: { background: 'var(--surface-elevated)', color: 'var(--text)' },
    border: 'var(--border)',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₦4,999',
    period: '/month',
    description: 'For serious sellers',
    features: [
      'Unlimited listings',
      'Boosted visibility',
      'Analytics dashboard',
      'Custom profile URL',
      'Priority support',
      'Verified Pro badge',
    ],
    cta: 'Upgrade to Pro',
    recommended: true,
    style: { background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: 'white' },
    border: 'transparent',
  },
  {
    id: 'business',
    name: 'Business',
    price: '₦9,999',
    period: '/month',
    description: 'For campus businesses',
    features: [
      'Everything in Pro',
      'Storefront page',
      'Inventory management',
      'Sales dashboard',
      'Promoted posts',
      'PDF invoice generation',
      'CSV data export',
    ],
    cta: 'Upgrade to Business',
    style: { background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: 'white' },
    border: 'transparent',
  },
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [selected, setSelected] = useState('pro');

  const handleUpgrade = () => {
    // Stripe integration would go here
    alert('Stripe payment integration coming soon! Contact support to upgrade manually.');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              variants={typeof window !== 'undefined' && window.innerWidth < 640 ? sheetVariants : modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 pb-8 overflow-y-auto max-h-[90dvh]"
              style={{ background: 'var(--surface)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    ⚡ OneStack Premium
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    Upgrade your account
                  </h2>
                </div>
                <button onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'var(--surface-elevated)' }}>
                  <FiX size={18} />
                </button>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Unlock more features to grow your campus presence
              </p>

              {/* Tier cards */}
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileTap={!tier.disabled ? { scale: 0.99 } : undefined}
                    className="cursor-pointer rounded-xl p-4 transition-all"
                    style={{
                      ...tier.style,
                      border: `2px solid ${selected === tier.id ? tier.border || 'var(--primary)' : 'var(--border)'}`,
                      opacity: tier.disabled ? 0.7 : 1,
                    }}
                    onClick={() => !tier.disabled && setSelected(tier.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{tier.name}</span>
                          {tier.recommended && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        {tier.price ? (
                          <>
                            <span className="text-lg font-black">{tier.price}</span>
                            <span className="text-xs opacity-70">{tier.period}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">Free</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs opacity-90">
                          <FiCheck size={12} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              {selected !== 'free' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleUpgrade}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white btn-premium"
                >
                  <FiZap size={16} />
                  {TIERS.find((t) => t.id === selected)?.cta}
                </motion.button>
              )}
              <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Cancel anytime. Secure payment via Stripe.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
