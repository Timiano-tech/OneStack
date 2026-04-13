'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { modalVariants, sheetVariants, backdropVariants } from '../../lib/animations';
import { useEffect, useState } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              variants={isMobile ? sheetVariants : modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden`}
              style={{ background: 'var(--surface)', border: isMobile ? 'none' : '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" 
                style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 overflow-y-auto max-h-[80dvh]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
