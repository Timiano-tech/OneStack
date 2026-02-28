import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMapPin, FiMessageCircle, FiShare2, FiFlag, FiChevronLeft, FiStar } from 'react-icons/fi';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { toast } from '../components/Toast';
import type { Listing } from '../types';

// Mock listing
const MOCK: Listing = {
  id: '1',
  userId: 'u1',
  type: 'sell',
  title: 'MacBook Pro 14" M3 - Like New',
  description:
    'Barely used MacBook Pro 14" with M3 chip. Comes with original box, charger, and 1 year of Apple Care remaining. No scratches, battery health 100%. Selling because I switched to a desktop setup.',
  price: 1299,
  currency: 'USD',
  category: 'Electronics',
  condition: 'like_new',
  images: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
  ],
  location: 'North Campus, Library building',
  campusId: 'c1',
  universityId: 'uni1',
  isPremium: true,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_SELLER = {
  id: 'u1',
  displayName: 'Alex Chen',
  photoURL: '',
  isVerifiedStudent: true,
  trustScore: 4.8,
};

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing] = useState<Listing>({ ...MOCK, id: id || MOCK.id });
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleShare = () => {
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

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:top-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
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
        <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700">
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
        <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Seller</h2>
          <div className="flex items-center justify-between gap-4">
            <Link
              to={`/profile/${MOCK_SELLER.id}`}
              className="flex items-center gap-3"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                {MOCK_SELLER.photoURL ? (
                  <img src={MOCK_SELLER.photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                    {MOCK_SELLER.displayName[0]}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {MOCK_SELLER.displayName}
                  </span>
                  {MOCK_SELLER.isVerifiedStudent && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      Verified
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <FiStar className="text-amber-500" size={14} />
                  {MOCK_SELLER.trustScore} rating
                </p>
              </div>
            </Link>
            <Link to={`/chat?listing=${listing.id}&seller=${listing.userId}`}>
              <Button leftIcon={FiMessageCircle}>Chat</Button>
            </Link>
          </div>
        </div>

        {/* Sticky CTA on mobile */}
        <div className="safe-bottom sticky bottom-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <Link to={`/chat?listing=${listing.id}&seller=${listing.userId}`} className="block">
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
