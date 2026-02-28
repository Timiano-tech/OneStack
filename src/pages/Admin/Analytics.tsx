import { motion } from 'framer-motion';
import { FiTrendingUp, FiEye, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { AnimatedPage } from '../../components/AnimatedPage';

const MOCK_CHART_DATA = [
  { label: 'Mon', listings: 12, users: 45 },
  { label: 'Tue', listings: 19, users: 52 },
  { label: 'Wed', listings: 15, users: 48 },
  { label: 'Thu', listings: 22, users: 61 },
  { label: 'Fri', listings: 28, users: 78 },
  { label: 'Sat', listings: 35, users: 92 },
  { label: 'Sun', listings: 30, users: 85 },
];

const maxListings = Math.max(...MOCK_CHART_DATA.map((d) => d.listings));
const maxUsers = Math.max(...MOCK_CHART_DATA.map((d) => d.users));

export function Analytics() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Traffic, engagement, and revenue metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Page views', value: '24.5k', icon: FiEye, change: '+12%' },
          { label: 'New listings', value: '342', icon: FiShoppingBag, change: '+8%' },
          { label: 'Premium revenue', value: '$1,240', icon: FiDollarSign, change: '+24%' },
          { label: 'Conversion', value: '3.2%', icon: FiTrendingUp, change: '+0.5%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {stat.change} vs last period
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Last 7 days</h2>
        <div className="mt-6 flex items-end justify-between gap-2">
          {MOCK_CHART_DATA.map((d, i) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-col gap-1">
                <div
                  className="w-full rounded-t bg-emerald-500 transition-all"
                  style={{ height: (d.listings / maxListings) * 80 }}
                />
                <div
                  className="w-full rounded-t bg-slate-300 dark:bg-slate-600"
                  style={{ height: (d.users / maxUsers) * 60 }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {d.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">New listings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">New users</span>
          </div>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
