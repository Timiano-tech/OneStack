import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiFlag, FiTrendingUp } from 'react-icons/fi';
import { AnimatedPage } from '../../components/AnimatedPage';

const stats = [
  { label: 'Total users', value: '2,847', icon: FiUsers, color: 'bg-blue-500', change: '+12%' },
  { label: 'Active listings', value: '1,203', icon: FiPackage, color: 'bg-emerald-500', change: '+8%' },
  { label: 'Pending reports', value: '7', icon: FiFlag, color: 'bg-amber-500', change: '-2' },
  { label: 'Revenue (premium)', value: '$1,240', icon: FiTrendingUp, color: 'bg-violet-500', change: '+24%' },
];

const recentActivity = [
  { type: 'listing', text: 'New listing "Calculus Textbook" by Alex C.', time: '2 min ago' },
  { type: 'user', text: '3 new user registrations', time: '15 min ago' },
  { type: 'report', text: 'Report #12 resolved', time: '1 hour ago' },
  { type: 'listing', text: 'Listing "Desk set" marked as sold', time: '2 hours ago' },
];

export function Dashboard() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Overview of your campus marketplace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {stat.change} from last week
                  </p>
                )}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${stat.color}`}
              >
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Recent activity</h2>
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-3 first:pt-0">
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/admin/reports"
              className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              Review reports
            </a>
            <a
              href="/admin/listings"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Moderate listings
            </a>
            <a
              href="/admin/users"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Manage users
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
