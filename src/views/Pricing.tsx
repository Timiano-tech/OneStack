import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiArrowLeft } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { SITE, PLANS } from '../config/site';

export function Pricing() {
  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-0 z-10 flex h-12 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <FiArrowLeft size={18} />
          Back
        </Link>
        <span className="ml-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {SITE.appName} · {SITE.campus.shortName}
        </span>
      </div>
      <div className="mx-auto max-w-lg px-4 py-8 pb-28">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {SITE.campus.shortName}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            Choose your plan
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {PLANS.free.name}
              </h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ₦0
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ forever</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FiCheck className="shrink-0 text-emerald-500" size={18} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-4 block">
              <Button variant="outline" fullWidth>
                Get started free
              </Button>
            </Link>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-lg shadow-emerald-500/10 dark:bg-slate-800 dark:shadow-emerald-500/5"
          >
            <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              <FiZap size={12} />
              Recommended
            </div>
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {PLANS.premium.name}
              </h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₦{PLANS.premium.price.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ month</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {PLANS.premium.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FiCheck className="shrink-0 text-emerald-400" size={18} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register?plan=premium" className="mt-4 block">
              <Button fullWidth>Subscribe to Premium</Button>
            </Link>
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Cancel anytime. Payment required to activate.
            </p>
          </motion.div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Questions? Contact{' '}
          <a href={`mailto:${SITE.supportEmail}`} className="text-emerald-600 dark:text-emerald-400">
            {SITE.supportEmail}
          </a>
        </p>
      </div>
    </AnimatedPage>
  );
}
