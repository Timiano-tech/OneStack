import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiChevronLeft } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { SITE } from '../config/site';

const PREMIUM_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0',
    period: '/ forever',
    description: 'Get started on campus',
    features: ['Up to 5 active listings', 'Basic messaging', 'Social feed access', 'Campus-only visibility'],
    cta: 'Current Plan',
    disabled: true,
    style: { background: 'var(--surface)', border: '1px solid var(--border)' }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₦4,999',
    period: '/ month',
    description: 'For serious sellers',
    features: ['Unlimited listings', 'Boosted visibility', 'Analytics dashboard', 'Custom profile URL', 'Priority support', 'Verified Pro badge'],
    cta: 'Upgrade to Pro',
    recommended: true,
    style: { 
      background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(124,58,237,0.05))', 
      border: '2px solid var(--primary)' 
    }
  },
  {
    id: 'business',
    name: 'Business',
    price: '₦9,999',
    period: '/ month',
    description: 'For campus businesses',
    features: ['Everything in Pro', 'Storefront page', 'Inventory management', 'Sales dashboard', 'Promoted posts', 'PDF invoice generation'],
    cta: 'Upgrade to Business',
    style: { 
      background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(239,68,68,0.05))', 
      border: '1px solid var(--secondary)' 
    }
  }
];

export function Pricing() {
  return (
    <AnimatedPage className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="glass-nav sticky top-14 z-30 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-2xl items-center">
          <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-elevated)]" style={{ color: 'var(--text-secondary)' }}>
             <FiChevronLeft size={20} />
          </Link>
          <h1 className="ml-2 text-sm font-bold" style={{ color: 'var(--text)' }}>Subscription Plans</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-10 pb-28">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            OneStack Premium
          </p>
          <h2 className="mt-2 text-3xl font-black" style={{ color: 'var(--text)' }}>
            Elevate your presence
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Choose the plan that fits your campus goals.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {PREMIUM_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative rounded-3xl p-6 overflow-hidden"
              style={plan.style}
            >
              {plan.recommended && (
                <div className="absolute -right-8 top-6 rotate-45 bg-amber-500 px-10 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                  Popular
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black" style={{ color: plan.id === 'pro' ? 'var(--primary)' : plan.id === 'business' ? 'var(--secondary)' : 'var(--text)' }}>
                    {plan.price}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" 
                      style={{ background: plan.id === 'pro' ? 'var(--primary-muted)' : plan.id === 'business' ? 'rgba(245,158,11,0.1)' : 'var(--surface-elevated)' }}>
                      <FiCheck size={12} style={{ color: plan.id === 'pro' ? 'var(--primary)' : plan.id === 'business' ? 'var(--secondary)' : 'var(--text-muted)' }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button 
                  fullWidth 
                  variant={plan.recommended ? 'primary' : 'outline'}
                  disabled={plan.disabled}
                  className={plan.id === 'business' ? 'btn-premium' : ''}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl p-6 text-center" style={{ background: 'var(--surface-elevated)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Have a custom requirement?
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            We offer special discounts for student organizations and events.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="mt-4 inline-block text-sm font-bold" style={{ color: 'var(--primary)' }}>
            Contact Support →
          </a>
        </div>
      </div>
    </AnimatedPage>
  );
}
