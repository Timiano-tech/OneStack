import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { syncUserToSupabase } from '../services/userService';
import { FcGoogle } from 'react-icons/fc';

const MOCK_UNIVERSITIES = [
  { 
    id: 'uni1', 
    name: 'Federal University of Technology Ilaro', 
    country: 'Nigeria', 
    campuses: [
      { id: 'c1', name: 'Campus', universityId: 'uni1' }, 
      { id: 'c2', name: 'Off Campus', universityId: 'uni1' }
    ] 
  }
];

export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    displayName: '',
    universityId: '',
    campusId: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const universities = MOCK_UNIVERSITIES;
  const selectedUni = universities.find((u) => u.id === form.universityId);
  const campuses = selectedUni?.campuses ?? [];

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!form.email.trim() && !form.phone.trim()) {
      next.email = 'Email or phone is required';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'At least 6 characters';
    if (!form.displayName.trim()) next.displayName = 'Name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!form.universityId) next.universityId = 'Select your university';
    if (!form.campusId) next.campusId = 'Select your campus';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 1) {
      setStep(2);
      setErrors({});
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            display_name: form.displayName,
            phone: form.phone,
            university_id: form.universityId,
            campus_id: form.campusId,
          }
        }
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');

      // Sync user to our public.users table
      await syncUserToSupabase(data.user, {
        displayName: form.displayName,
        universityId: form.universityId,
        campusId: form.campusId,
      });

      toast.success('Account created! Please check your email to verify.');
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Try again.');
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
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed.');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AnimatedPage className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-full max-w-md text-center"
        >
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <FiMail size={40} />
          </div>
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="mt-4 text-slate-300">
            We've sent a verification link to <span className="font-semibold text-white">{form.email}</span>. 
            Please verify your email address before logging in.
          </p>
          <div className="mt-10">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Go to login
              </Button>
            </Link>
          </div>
        </motion.div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:p-8">
          <div className="mb-6 flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}
              />
            ))}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {step === 1 ? 'Create account' : 'Your campus'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {step === 1
              ? 'Sign up with email or phone to join OneStack.'
              : 'Select your university and campus. Listings are visible only to your campus.'}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  leftIcon={FiMail}
                  error={errors.email}
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  leftIcon={FiPhone}
                />
                <Input
                  label="Display name"
                  type="text"
                  placeholder="How others see you"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  leftIcon={FiUser}
                  error={errors.displayName}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  leftIcon={FiLock}
                  error={errors.password}
                />
                
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
              </div>
            )}
            
            {step === 2 && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    University
                  </label>
                  <select
                    value={form.universityId}
                    onChange={(e) => setForm((f) => ({ ...f, universityId: e.target.value, campusId: '' }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select university</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {errors.universityId && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.universityId}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Campus
                  </label>
                  <select
                    value={form.campusId}
                    onChange={(e) => setForm((f) => ({ ...f, campusId: e.target.value }))}
                    disabled={!form.universityId}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select campus</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.campusId && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.campusId}</p>
                  )}
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button type="submit" fullWidth={step === 1} size="lg" loading={loading} className={step === 2 ? 'flex-1' : ''}>
                {step === 1 ? 'Continue' : 'Create account'}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
