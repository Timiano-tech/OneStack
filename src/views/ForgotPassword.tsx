"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
       {/* Left panel — branding (Reuse the same look as auth page) */}
       <div className="auth-panel-left">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="text-white font-black text-2xl tracking-tight">One<span className="text-red-300">Stack</span></span>
          </div>
          <h1 className="auth-headline">Secure your<br />account.</h1>
          <p className="auth-subline">
            We'll help you get back into your campus community in no time.
          </p>
        </div>
        <div className="auth-deco-circle auth-deco-1" />
        <div className="auth-deco-circle auth-deco-2" />
      </div>

      <div className="auth-panel-right">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="auth-card"
        >
          <div className="mb-6">
            <Link href="/auth" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#D60000] dark:text-slate-400 dark:hover:text-red-400 transition-colors">
              <FiArrowLeft /> Back to Sign in
            </Link>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
              Forgot password?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No worries! Enter your email and we'll send you a link to reset it.
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <FiMail className="auth-icon" />
                  <input
                    type="email"
                    required
                    placeholder="you@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading 
                  ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> 
                  : 'Send Reset Link'
                }
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="py-6 text-center space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FiCheckCircle size={30} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your inbox</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A password reset link has been sent to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setSent(false)} 
                  className="text-xs font-semibold text-[#D60000] hover:underline dark:text-red-400"
                >
                  Didn't get the email? Try again
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
