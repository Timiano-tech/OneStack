import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from '../components/Toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      // TODO: Firebase sendPasswordResetEmail
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
      toast.success('Check your email for a reset link.');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reset password</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Enter your email and we'll send you a link to reset your password.
        </p>
        {sent ? (
          <p className="mt-6 text-center text-sm text-emerald-600 dark:text-emerald-400">
            Reset link sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={FiMail}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-4">
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link to="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </AnimatedPage>
  );
}
