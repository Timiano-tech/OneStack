"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { FcGoogle } from 'react-icons/fc';

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (!data.user) {
        throw new Error('No user data returned');
      }

      toast.success('Welcome back!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed.');
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sign in</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Use your email to sign in to OneStack.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={FiMail}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={FiLock}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign in
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="relative"
            >
              <FcGoogle className="absolute left-4 h-5 w-5" />
              Sign in with Google
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Sign up
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          By signing in you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </AnimatedPage>
  );
}

