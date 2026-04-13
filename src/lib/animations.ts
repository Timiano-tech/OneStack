// OneStack — Framer Motion Animation Variants
// Centralized animation library for consistent motion across the app

import type { Variants } from 'framer-motion';

// ─── Page Transitions ───────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2 } },
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 280 } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.2 } },
};

// ─── List Stagger ────────────────────────────────────────────────────────────

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 18, stiffness: 200 },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

// ─── Like Button Heart Burst ─────────────────────────────────────────────────

export const heartVariants: Variants = {
  liked: {
    scale: [1, 1.5, 1.25, 1.35, 1.0],
    rotate: [0, -10, 8, -5, 0],
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  unliked: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.2 },
  },
};

// ─── Modal / Sheet ───────────────────────────────────────────────────────────

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 22, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 20,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const sheetVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ─── Chat Bubbles ─────────────────────────────────────────────────────────────

export const chatBubbleVariant: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
};

export const chatBubbleMineVariant: Variants = {
  hidden: { opacity: 0, x: 20, scale: 0.9 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationSlideIn: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 280 },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

export const notificationBellVariant: Variants = {
  ring: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  idle: { rotate: 0 },
};

// ─── Story Ring ───────────────────────────────────────────────────────────────

export const storyVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 18, stiffness: 250 },
  },
};

// ─── Paper Plane Send ─────────────────────────────────────────────────────────

export const paperPlaneVariants: Variants = {
  idle: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
  fly: {
    x: [0, 20, 60],
    y: [0, -15, -50],
    rotate: [0, -20, -40],
    opacity: [1, 0.7, 0],
    scale: [1, 0.9, 0.4],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Hover / Tap Helpers (use directly in motion props) ──────────────────────

export const hoverLift = {
  whileHover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  whileTap: { scale: 0.97, y: 0 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
};

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
};

export const tapScale = {
  whileTap: { scale: 0.93 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
};

// ─── Pull to Refresh ──────────────────────────────────────────────────────────

export const pullRefreshVariants: Variants = {
  hidden: { opacity: 0, y: -40, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

// ─── Reaction Picker ──────────────────────────────────────────────────────────

export const reactionContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 18, stiffness: 320, staggerChildren: 0.04 },
  },
  exit: { opacity: 0, scale: 0.7, y: 8, transition: { duration: 0.15 } },
};

export const reactionItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 16, stiffness: 300 },
  },
};

// ─── Accordion / Collapse ─────────────────────────────────────────────────────

export const expandVariants: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: { height: 'auto', opacity: 1, overflow: 'visible', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

// ─── Skeleton Pulse ───────────────────────────────────────────────────────────

export const skeletonVariants: Variants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};
