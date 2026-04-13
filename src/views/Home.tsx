import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiTrendingUp, FiMessageCircle, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { ListingCard } from '../components/ListingCard';
import { SITE } from '../config/site';
import type { Listing } from '../types';
import { getListings } from '../services/listingService';
import { ListingCardSkeleton } from '../components/ui/SkeletonLoader';
import { containerVariants, itemVariants } from '../lib/animations';

const categories = [
  { name: 'Electronics', count: 24, slug: 'electronics', emoji: '💻' },
  { name: 'Books', count: 56, slug: 'books', emoji: '📚' },
  { name: 'Services', count: 18, slug: 'services', emoji: '🛠️' },
  { name: 'Fashion', count: 42, slug: 'fashion', emoji: '👟' },
];

export function Home() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getListings();
        setFeaturedListings(data.slice(0, 3)); 
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <AnimatedPage className="pb-24">
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        {/* Abstract background blobs */}
        <div className="absolute top-0 -left-20 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-900/10" />
        <div className="absolute top-40 -right-20 -z-10 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-900/10" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ 
                background: 'var(--primary-muted)', 
                color: 'var(--primary)',
                borderColor: 'rgba(37,99,235,0.2)'
              }}
            >
              <FiZap size={12} className="fill-current" />
              {SITE.campus.shortName}'s Premier Marketplace
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-8 text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl"
              style={{ color: 'var(--text)', lineHeight: 0.9 }}
            >
              Buy, Sell, <br />
              <span className="text-gradient">Student-First.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 max-w-2xl text-lg font-medium leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              The premium social marketplace built exclusively for students. 
              Verified campus community. Instant chat. Real-time stories.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link href="/listings">
                <button className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 text-base font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-blue-500/25 active:scale-95"
                  style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}>
                  Start Exploring
                  <FiArrowRight size={18} />
                </button>
              </Link>
              <Link href="/register">
                <button className="h-14 rounded-2xl px-8 text-base font-bold transition-all hover:bg-[var(--surface-elevated)]"
                  style={{ color: 'var(--text)', border: '1px solid var(--border)' }}>
                  Join the Campus
                </button>
              </Link>
            </motion.div>
            
            {/* Stats / Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#64748b]"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[var(--bg)] bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <span>Trusted by 2,000+ Students</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Browse Collections
            </h2>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Find exactly what you need in seconds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <Link key={cat.slug} href={`/listings?category=${cat.slug}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, background: 'var(--surface-elevated)' }}
                className="group flex flex-col items-center justify-center rounded-3xl p-8 text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-4xl mb-4 grayscale transition-all group-hover:grayscale-0 group-hover:scale-110">
                  {cat.emoji}
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{cat.name}</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  {cat.count} Items
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Hot Right Now
          </h2>
          <Link href="/listings" className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-primary"
            style={{ color: 'var(--primary)' }}>
            See context <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             <ListingCardSkeleton />
             <ListingCardSkeleton />
             <ListingCardSkeleton />
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredListings.map((listing, i) => (
              <motion.div key={listing.id} variants={itemVariants}>
                <ListingCard listing={listing} index={i} />
              </motion.div>
            ))}
            
            {featuredListings.length === 0 && (
              <div className="col-span-full py-20 text-center rounded-3xl" style={{ border: '2px dashed var(--border)' }}>
                 <p style={{ color: 'var(--text-muted)' }}>No featured listings yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Features Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-[3rem] p-12 overflow-hidden relative"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <FiTrendingUp size={240} />
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-3">
            {[
              { 
                icon: FiShield, 
                title: 'Verified Only', 
                desc: 'Every user is a verified student from your campus. Say goodbye to bots and scammers.' 
              },
              { 
                icon: FiMessageCircle, 
                title: 'Story Selling', 
                desc: 'Record a video of your item, post it as a story, and sell it before it even hits the market.' 
              },
              { 
                icon: FiZap, 
                title: 'Trust System', 
                desc: 'Our Trust Score algorithm ensures you only deal with the most reliable sellers.' 
              }
            ].map((feat, i) => (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" 
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[3rem] p-12 text-center"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
            boxShadow: '0 20px 40px rgba(37,99,235,0.2)'
          }}>
          <h2 className="text-4xl font-black text-white sm:text-5xl">Ready to join your campus?</h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto font-medium">
            Join thousands of students building the future of campus commerce.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row justify-center">
            <Link href="/register">
              <button className="h-14 rounded-2xl bg-white px-10 text-base font-black text-primary transition-all hover:scale-105 active:scale-95">
                Create Account
              </button>
            </Link>
            <Link href="/login">
              <button className="h-14 rounded-2xl bg-white/10 px-10 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

    </AnimatedPage>
  );
}
