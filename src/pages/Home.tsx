import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiShield, FiTrendingUp, FiMessageCircle } from 'react-icons/fi';
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
    <AnimatedPage className="bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-8 text-white sm:py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
        <div className="relative mx-auto max-w-lg sm:max-w-7xl">
          <p className="text-sm font-medium text-emerald-100">{SITE.campus.shortName}</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Your campus marketplace.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mt-2 max-w-md text-sm text-emerald-50 sm:text-base"
          >
            Buy, sell, and trade with verified FUT Ilaro students. Items, services & more—all in one app.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="mt-5 flex flex-wrap gap-2"
          >
            <Link to="/listings">
              <Button
                size="md"
                variant="secondary"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                leftIcon={FiSearch}
              >
                Browse
              </Button>
            </Link>
            <Link to="/register">
              <Button size="md" variant="outline" className="border-white text-white hover:bg-white/10" leftIcon={FiPlus}>
                Get started
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="md" variant="ghost" className="text-white hover:bg-white/10">
                Premium
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-6 text-slate-600 dark:text-slate-400 sm:max-w-7xl sm:gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <FiShield className="text-emerald-500" size={20} />
            <span className="text-xs font-medium sm:text-sm">FUT Ilaro students only</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <FiMessageCircle className="text-emerald-500" size={20} />
            <span className="text-xs font-medium sm:text-sm">In-app chat</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <FiTrendingUp className="text-emerald-500" size={20} />
            <span className="text-xs font-medium sm:text-sm">Premium boosts</span>
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
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-800"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">{cat.name}</span>
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
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              View all
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
