import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiTrendingUp, FiMessageCircle, FiZap } from 'react-icons/fi';
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
      {/* Substack-style Clean Hero */}
      <section className="relative px-4 py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="relative mx-auto max-w-3xl text-center sm:text-left">
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-6"
            >
              <FiZap className="h-3.5 w-3.5" />
              <span>{SITE.campus.shortName} Exclusive</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-2 text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white leading-[1.1]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
            >
              Your campus marketplace, <br className="hidden sm:block"/>
              <span className="text-accent italic font-normal">elevated.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto sm:mx-0"
            >
              Read, buy, sell, and trade with verified FUT Ilaro students. A trusted community for items, services, and local connections.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/listings" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-accent text-white rounded-full hover:opacity-90 transition-opacity"
                  leftIcon={FiSearch}
                >
                  Start Exploring
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto rounded-full bg-white text-slate-900 border-slate-300 hover:bg-slate-50 dark:bg-transparent dark:text-white dark:border-slate-600 dark:hover:bg-slate-800 font-medium transition-colors" 
                >
                  Create an account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-8">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-slate-600 dark:text-slate-400">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <FiShield size={24} className="text-slate-400" />
            <span className="text-sm font-medium tracking-wide uppercase">Students only</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <FiMessageCircle size={24} className="text-slate-400" />
            <span className="text-sm font-medium tracking-wide uppercase">Direct chat</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <FiTrendingUp size={24} className="text-slate-400" />
            <span className="text-sm font-medium tracking-wide uppercase">Campus reach</span>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-lg sm:max-w-7xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Categories</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {categories.map((cat, i) => (
              <Link key={cat.slug} href={`/listings?category=${cat.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-border rounded-xl p-6"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-accent transition-colors block mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{cat.name}</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cat.count} listings</p>
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
              href="/listings"
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
