import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFlag, FiCheck, FiX } from 'react-icons/fi';
import { AnimatedPage } from '../../components/AnimatedPage';
import { Button } from '../../components/Button';

const MOCK_REPORTS = [
  { id: 'r1', type: 'listing', targetTitle: 'Math Tutoring', reason: 'Spam', description: 'Duplicate post', status: 'pending', createdAt: '2024-02-26' },
  { id: 'r2', type: 'user', targetTitle: 'User: john@uni.edu', reason: 'Fraud', description: 'Never sent item', status: 'pending', createdAt: '2024-02-25' },
  { id: 'r3', type: 'listing', targetTitle: 'Old textbook', reason: 'Inappropriate', description: 'Offensive description', status: 'resolved', createdAt: '2024-02-24' },
];

export function Reports() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const filtered = MOCK_REPORTS.filter(
    (r) => statusFilter === 'all' || r.status === statusFilter
  );

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Review and resolve user reports.
        </p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'resolved', 'all'] as const).map((s) => (
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

      <div className="space-y-4">
        {filtered.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <FiFlag size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {report.type}: {report.targetTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Reason: {report.reason}
                  </p>
                  {report.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                      "{report.description}"
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {report.createdAt} · {report.status}
                  </p>
                </div>
              </div>
              {report.status === 'pending' && (
                <div className="flex gap-2 sm:shrink-0">
                  <Button variant="outline" size="sm" leftIcon={FiX}>
                    Dismiss
                  </Button>
                  <Button size="sm" leftIcon={FiCheck}>
                    Resolve
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-slate-500 dark:text-slate-400">
          No reports match your filter.
        </p>
      )}
    </AnimatedPage>
  );
}
