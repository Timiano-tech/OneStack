"use client";

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../../lib/supabase';
import { syncUserToSupabase } from '../../services/userService';
import { toast } from '../../components/Toast';

const UNIVERSITIES = [
  {
    id: 'uni1',
    name: 'Federal University of Technology Ilaro',
    campuses: [
      { id: 'c1', name: 'Main Campus' },
      { id: 'c2', name: 'Off Campus' },
    ],
  },
];

type Tab = 'login' | 'register';

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [signingIn, setSigningIn] = useState(false);
  
  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        toast.success('Welcome back!');
        setSigningIn(true);
        
        // Force a router refresh to update session in middleware and AuthContext
        router.refresh();
        
        // Force a router refresh to update session in middleware and AuthContext
        router.refresh();
        
        // Use a slightly longer delay to allow cookies to propagate in dev environment
        const next = searchParams.get('next') || '/';
        window.location.href = next; // Definitive redirect for production reliability
      } catch (err: any) {
        if (err.message === 'Failed to fetch') {
          toast.error('Network error: Unable to reach Supabase. Please check your internet or disable ad-blockers.');
        } else {
          toast.error(err.message || 'Invalid email or password.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    const handleGoogle = async () => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
      } catch (err: any) {
        toast.error(err.message || 'Google sign in failed.');
        setLoading(false);
      }
    };
  
    if (signingIn) {
      return (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
             <div className="h-20 w-20 rounded-full border-4 border-slate-100 dark:border-slate-800" />
             <div className="absolute top-0 h-20 w-20 rounded-full border-4 border-[#D60000] border-t-transparent animate-spin" />
             <FiUser size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D60000]" />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Preparing your Feed</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">Connecting to campus community...</p>
          </motion.div>
        </div>
      );
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="auth-label">Email</label>
        <div className="auth-input-wrap">
          <FiMail className="auth-icon" />
          <input
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`auth-input ${errors.email ? 'border-red-500 focus:ring-red-400' : ''}`}
          />
        </div>
        {errors.email && <p className="auth-error">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label className="auth-label">Password</label>
          <Link href="/forgot-password" className="text-xs font-medium text-[#D60000] hover:underline dark:text-red-400">
            Forgot password?
          </Link>
        </div>
        <div className="auth-input-wrap">
          <FiLock className="auth-icon" />
          <input
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`auth-input pr-11 ${errors.password ? 'border-red-500 focus:ring-red-400' : ''}`}
          />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="auth-eye-btn">
            {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
        {errors.password && <p className="auth-error">{errors.password}</p>}
      </div>

      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Sign in <FiArrowRight /></>}
      </button>

      <div className="auth-divider"><span>Or continue with</span></div>

      <button type="button" onClick={handleGoogle} disabled={loading} className="auth-google-btn">
        <FcGoogle size={20} />
        Continue with Google
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-[#D60000] hover:underline dark:text-red-400">
          Sign up free
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', universityId: '', campusId: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedUni = UNIVERSITIES.find(u => u.id === form.universityId);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.universityId) e.universityId = 'Select your university';
    if (!form.campusId) e.campusId = 'Select your campus';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      setErrors({});
      return;
    }
    if (!validateStep2()) return;
    
    // Robust user verification
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (e) {
      console.error('Middleware auth error:', e);
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName, campus_id: form.campusId } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');
      await syncUserToSupabase(data.user, { fullName: form.fullName, campusId: form.campusId });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-4">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <FiMail size={30} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your inbox</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a verification link to <span className="font-semibold text-slate-800 dark:text-slate-200">{form.email}</span>. Verify your email to start using OneStack.
        </p>
        <button onClick={onSwitch} className="mt-2 text-sm font-semibold text-[#D60000] hover:underline dark:text-red-400">
          Back to Sign in
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#D60000]' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Step {step} of 2 — {step === 1 ? 'Account details' : 'Your campus'}
      </p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <FiUser className="auth-icon" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className={`auth-input ${errors.fullName ? 'border-red-500 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-icon" />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`auth-input ${errors.email ? 'border-red-500 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="auth-error">{errors.email}</p>}
            </div>
            {/* Password */}
            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <FiLock className="auth-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`auth-input pr-11 ${errors.password ? 'border-red-500 focus:ring-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="auth-eye-btn">
                  {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="auth-error">{errors.password}</p>}
            </div>

            <div className="auth-divider"><span>Or continue with</span></div>
            <button type="button" onClick={handleGoogle} disabled={loading} className="auth-google-btn">
              <FcGoogle size={20} />
              Continue with Google
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div>
              <label className="auth-label">University</label>
              <select
                value={form.universityId}
                onChange={e => setForm(f => ({ ...f, universityId: e.target.value, campusId: '' }))}
                className={`auth-select ${errors.universityId ? 'border-red-500' : ''}`}
              >
                <option value="">Select university</option>
                {UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.universityId && <p className="auth-error">{errors.universityId}</p>}
            </div>
            <div>
              <label className="auth-label">Campus</label>
              <select
                value={form.campusId}
                onChange={e => setForm(f => ({ ...f, campusId: e.target.value }))}
                disabled={!form.universityId}
                className={`auth-select disabled:opacity-40 ${errors.campusId ? 'border-red-500' : ''}`}
              >
                <option value="">Select campus</option>
                {(selectedUni?.campuses || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.campusId && <p className="auth-error">{errors.campusId}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex gap-3 ${step === 2 ? '' : ''}`}>
        {step === 2 && (
          <button type="button" onClick={() => setStep(1)} className="auth-back-btn">
            Back
          </button>
        )}
        <button type="submit" disabled={loading} className="auth-submit-btn flex-1">
          {loading
            ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            : step === 1 ? <>Continue  <FiArrowRight /></> : <>Create account <FiArrowRight /></>}
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-[#D60000] hover:underline dark:text-red-400">
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="auth-root">
      {/* Left panel — branding */}
      <div className="auth-panel-left">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="text-white font-black text-2xl tracking-tight">One<span className="text-red-300">Stack</span></span>
          </div>
          <h1 className="auth-headline">Your campus.<br />Your marketplace.</h1>
          <p className="auth-subline">
            Buy, sell, connect, and thrive — all within your university community.
          </p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
            }}
            className="auth-features"
          >
            {['Campus-verified listings', 'Real-time messaging', 'Student-only feed', 'Secure transactions'].map(f => (
              <motion.div 
                key={f} 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="auth-feature-item"
              >
                <span className="auth-feature-dot" />
                {f}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="auth-deco-circle auth-deco-1" />
        <div className="auth-deco-circle auth-deco-2" />
      </div>

      {/* Right panel — form */}
      <div className="auth-panel-right">
        {/* Theme‑aware card */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="auth-card"
        >
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              onClick={() => setTab('login')}
              className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : 'auth-tab-inactive'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`auth-tab ${tab === 'register' ? 'auth-tab-active' : 'auth-tab-inactive'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {tab === 'login' ? 'Welcome back 👋' : 'Join OneStack 🎓'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {tab === 'login'
                ? 'Enter your credentials to access your campus.'
                : 'Create your free account in under 2 minutes.'}
            </p>
          </div>

          <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading...</div>}>
            <AnimatePresence mode="wait">
              {tab === 'login'
                ? <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoginForm onSwitch={() => setTab('register')} /></motion.div>
                : <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RegisterForm onSwitch={() => setTab('login')} /></motion.div>}
            </AnimatePresence>
          </Suspense>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          By continuing you agree to our{' '}
          <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-400">Terms</Link> and{' '}
          <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-400">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
