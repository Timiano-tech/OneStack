'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiBookOpen, FiCalendar } from 'react-icons/fi';
import { modalVariants, sheetVariants, backdropVariants } from '../../lib/animations';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../Toast';
import { supabase } from '../../lib/supabase';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialValues?: {
    fullName?: string;
    bio?: string;
    major?: string;
    gradYear?: number;
  };
}

export function EditProfileModal({ open, onClose, onSaved, initialValues }: EditProfileModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: initialValues?.fullName || '',
    bio: initialValues?.bio || '',
    major: initialValues?.major || '',
    gradYear: initialValues?.gradYear?.toString() || '',
  });
  const [saving, setSaving] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const handleSave = async () => {
    if (!user) return;
    if (!form.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.fullName.trim(),
          bio: form.bio.trim() || null,
          major: form.major.trim() || null,
          grad_year: form.gradYear ? parseInt(form.gradYear) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated!');
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const Content = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <FiUser size={13} className="inline mr-1.5" />
          Full name *
        </label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}
          placeholder="Your name"
          maxLength={50}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          rows={3}
          className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all resize-none"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}
          placeholder="Tell the campus about yourself..."
          maxLength={200}
        />
        <p className="mt-0.5 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
          {form.bio.length}/200
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <FiBookOpen size={13} className="inline mr-1.5" />
            Major
          </label>
          <input
            type="text"
            value={form.major}
            onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}
            placeholder="e.g. Computer Science"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <FiCalendar size={13} className="inline mr-1.5" />
            Grad year
          </label>
          <input
            type="number"
            value={form.gradYear}
            onChange={(e) => setForm((f) => ({ ...f, gradYear: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}
            placeholder="2026"
            min={2020}
            max={2035}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--primary)' }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {isMobile ? (
            // Mobile: bottom sheet
            <div className="fixed inset-x-0 bottom-0 z-50">
              <motion.div
                variants={sheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-t-3xl p-6 pb-8"
                style={{ background: 'var(--surface)' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                    Edit Profile
                  </h2>
                  <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: 'var(--surface-elevated)' }}>
                    <FiX size={16} />
                  </button>
                </div>
                {Content}
              </motion.div>
            </div>
          ) : (
            // Desktop: centered dialog
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-md rounded-2xl p-6 shadow-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                    Edit Profile
                  </h2>
                  <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: 'var(--surface-elevated)' }}>
                    <FiX size={16} />
                  </button>
                </div>
                {Content}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
