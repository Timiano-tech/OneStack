import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiTrash2 } from 'react-icons/fi';
import { AnimatedPage } from '../../components/AnimatedPage';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const MOCK_LISTINGS = [
  { id: '1', title: 'MacBook Pro 14"', price: 1299, status: 'active', reported: false, createdAt: '2024-02-25' },
  { id: '2', title: 'Math Tutoring', price: 25, status: 'active', reported: true, createdAt: '2024-02-24' },
  { id: '3', title: 'IKEA Desk Set', price: 120, status: 'sold', reported: false, createdAt: '2024-02-20' },
];

export function Listings() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'removed'>('all');

  const filtered = MOCK_LISTINGS.filter((l) => {
    const matchQuery = !query || l.title.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Listing moderation</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Review, approve, or remove listings.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search listings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={FiSearch}
            className="bg-white dark:bg-slate-800"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'pending', 'removed'] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Listing
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Reported
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map((listing, i) => (
                <motion.tr
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    ${listing.price}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        listing.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : listing.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {listing.reported ? (
                      <span className="text-amber-600 dark:text-amber-400">Yes</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {listing.createdAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" leftIcon={FiEye}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={FiTrash2} className="text-red-600">
                        Remove
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
}
