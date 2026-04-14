import { motion } from 'framer-motion';

const defaultVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const defaultTransition = { duration: 0.2, ease: 'easeOut' as const };

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variants?: typeof defaultVariants;
  transition?: typeof defaultTransition;
}

export function AnimatedPage({
  children,
  className = '',
  style,
  variants = defaultVariants,
  transition = defaultTransition,
}: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
