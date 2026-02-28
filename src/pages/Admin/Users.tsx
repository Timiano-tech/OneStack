import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiMoreVertical } from 'react-icons/fi';
import { AnimatedPage } from '../../components/AnimatedPage';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const MOCK_USERS = [
  { id: 'u1', displayName: 'Alex Chen', email: 'alex@uni.edu', role: 'user', isVerified: true, joined: '2024-01-15' },
  { id: 'u2', displayName: 'Jordan Lee', email: 'jordan@uni.edu', role: 'user', isVerified: true, joined: '2024-02-01' },
  { id: 'u3', displayName: 'Sam Taylor', email: 'sam@uni.edu', role: 'user', isVerified: false, joined: '2024-02-20' },
];

export function Users() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'recent'>('all');

  const filtered = MOCK_USERS.filter((u) => {
    const matchQuery =
      !query ||
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    if (!matchQuery) return false;
    if (filter === 'verified' && !u.isVerified) return false;
    return true;
  });

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User management</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            View and manage registered users.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={FiSearch}
            className="bg-white dark:bg-slate-800"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'recent'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : 'Recent'}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                        {user.displayName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {user.displayName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <FiShield size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                      <FiMoreVertical size={18} />
                    </button>
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
