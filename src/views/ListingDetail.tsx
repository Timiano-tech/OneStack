import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMapPin, FiMessageCircle, FiShare2, FiFlag, FiChevronLeft, FiStar } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { toast } from '../components/Toast';
import type { Listing } from '../types';
import { getListingById } from '../services/listingService';
import { supabase } from '../lib/supabase';

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getListingById(id);
        if (data) {
          setListing(data);
          
          // Fetch seller profile
          const { data: sellerProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.userId)
            .single();
            
          if (sellerProfile) {
            setSeller({
              id: sellerProfile.id,
              displayName: sellerProfile.display_name,
              photoURL: sellerProfile.photo_url,
              isVerifiedStudent: sellerProfile.is_verified_student,
              trustScore: sellerProfile.trust_score,
            });
          }
        } else {
          toast.error('Listing not found');
          router.push('/listings');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching listing');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleShare = () => {
    if (!listing) return;
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading) {
    return (
      <AnimatedPage className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      </AnimatedPage>
    );
  }

  if (!listing) return null;

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:top-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <FiChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiHeart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiShare2 size={22} />
          </button>
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiFlag size={22} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Image gallery */}
        <div className="relative aspect-4/3 bg-slate-200 dark:bg-slate-700">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={listing.images[currentImage] || listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
          {listing.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {listing.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentImage(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentImage ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          {listing.isPremium && (
            <span className="absolute left-3 top-3 rounded-lg bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
              Boosted
            </span>
          )}
          {listing.type === 'service' && (
            <span className="absolute right-3 top-3 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
              Service
            </span>
          )}
        </div>

        <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {listing.category}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
            {listing.title}
          </h1>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {listing.currency} {listing.price.toLocaleString()}
          </p>
          {listing.condition && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Condition: {listing.condition.replace('_', ' ')}
            </p>
          )}
          {listing.location && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FiMapPin size={16} />
              {listing.location}
            </p>
          )}
        </div>

        <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-400">
            {listing.description}
          </p>
        </div>

        {/* Seller card */}
        {seller && (
          <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Seller</h2>
            <div className="flex items-center justify-between gap-4">
              <Link
                href={`/profile/${seller.id}`}
                className="flex items-center gap-3"
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                  {seller.photoURL ? (
                    <img src={seller.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                      {seller.displayName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {seller.displayName}
                    </span>
                    {seller.isVerifiedStudent && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <FiStar className="text-amber-500" size={14} />
                    {seller.trustScore} rating
                  </p>
                </div>
              </Link>
              <Link href={`/chat?listing=${listing.id}&seller=${listing.userId}`}>
                <Button leftIcon={FiMessageCircle}>Chat</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Sticky CTA on mobile */}
        <div className="safe-bottom sticky bottom-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <Link href={`/chat?listing=${listing.id}&seller=${listing.userId}`} className="block">
            <Button fullWidth size="lg" leftIcon={FiMessageCircle}>
              Message seller
            </Button>
          </Link>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-t-2xl bg-white p-6 dark:bg-slate-800 sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Report listing
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Report inappropriate or fraudulent content. Our team will review it.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  toast.success('Report submitted. Thank you.');
                  setShowReport(false);
                }}
              >
                Submit report
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatedPage>
  );
}
