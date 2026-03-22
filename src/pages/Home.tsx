import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiShield, FiTrendingUp, FiMessageCircle, FiZap } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { ListingCard } from '../components/ListingCard';
import { SITE } from '../config/site';
import type { Listing } from '../types';

// Mock featured listings for demo
const featuredListings: Listing[] = [
  {
    id: '1',
    userId: 'u1',
    type: 'sell',
    title: 'MacBook Pro 14" M3 - Like New',
    description: 'Barely used, with box and charger.',
    price: 1299,
    currency: 'USD',
    category: 'Electronics',
    condition: 'like_new',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    location: 'North Campus',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'u2',
    type: 'service',
    title: 'Math & Physics Tutoring',
    description: 'Senior year student. All levels.',
    price: 25,
    currency: 'USD',
    category: 'Tutoring',
    images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'],
    location: 'Central Library',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'u3',
    type: 'sell',
    title: 'IKEA Desk + Chair Set',
    description: 'Moving out. Great condition.',
    price: 120,
    currency: 'USD',
    category: 'Furniture',
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'],
    location: 'South Dorms',
    campusId: 'c1',
    universityId: 'uni1',
    isPremium: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories = [
  { name: 'Electronics', count: 24, slug: 'electronics' },
  { name: 'Books', count: 56, slug: 'books' },
  { name: 'Services', count: 18, slug: 'services' },
  { name: 'Furniture', count: 12, slug: 'furniture' },
];

export function Home() {
  return (
    <AnimatedPage className="">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-8 sm:py-16">
        <div className="absolute inset-0 bg-gradient-premium opacity-10 dark:opacity-20 blur-3xl -z-10 rounded-full w-3/4 h-3/4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative mx-auto max-w-lg sm:max-w-7xl glass rounded-3xl p-8 sm:p-12 border border-white/20 dark:border-slate-700/50 shadow-glass overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-3 py-1 text-sm font-medium text-blue-700 backdrop-blur-md dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300 mb-6"
            >
              <FiZap className="h-4 w-4" />
              <span>{SITE.campus.shortName} Exclusive</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-white"
            >
              Your campus <span className="text-gradient">marketplace.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 max-w-lg text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              Buy, sell, and trade with verified FUT Ilaro students. Items, services, and more—all in one premium app.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/listings">
                <Button
                  size="lg"
                  className="bg-gradient-premium border-0 text-white shadow-glow hover:scale-105 transition-transform"
                  leftIcon={FiSearch}
                >
                  Browse Now
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" 
                  leftIcon={FiPlus}
                >
                  Get started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-4 py-4 sm:py-6 relative z-10 -mt-8 sm:-mt-12">
        <div className="mx-auto max-w-lg sm:max-w-4xl glass rounded-2xl flex flex-wrap items-center justify-center gap-6 text-slate-700 dark:text-slate-300 py-5 sm:gap-12 shadow-soft">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FiShield size={20} />
            </div>
            <span className="text-sm font-semibold">FUT Ilaro students only</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <FiMessageCircle size={20} />
            </div>
            <span className="text-sm font-semibold">In-app chat</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <FiTrendingUp size={20} />
            </div>
            <span className="text-sm font-semibold">Premium boosts</span>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-lg sm:max-w-7xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Categories</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {categories.map((cat, i) => (
              <Link key={cat.slug} to={`/listings?category=${cat.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl glass p-5 transition-all hover:-translate-y-1 hover:shadow-glow hover:border-blue-400 dark:hover:border-blue-500 group"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cat.name}</span>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cat.count} listings</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="px-4 pb-8 sm:pb-12">
        <div className="mx-auto max-w-lg sm:max-w-7xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Featured</h2>
            <Link
              to="/listings"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}
