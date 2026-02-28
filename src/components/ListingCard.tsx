import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiStar } from 'react-icons/fi';
import type { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onFavoriteToggle?: (listingId: string) => void;
  index?: number;
}

export function ListingCard({
  listing,
  isFavorite = false,
  onFavoriteToggle,
  index = 0,
}: ListingCardProps) {
  const imageUrl = listing.images?.[0] || '/placeholder-listing.jpg';
  const isService = listing.type === 'service';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="group"
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700">
            <img
              src={imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            {listing.isPremium && (
              <span className="absolute left-2 top-2 rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                Boosted
              </span>
            )}
            {isService && (
              <span className="absolute right-2 top-2 rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                Service
              </span>
            )}
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onFavoriteToggle(listing.id);
                }}
                className="absolute right-2 bottom-2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-700"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}
                />
              </button>
            )}
          </div>
          <div className="p-3">
            <h3 className="line-clamp-2 font-semibold text-slate-800 dark:text-slate-100">
              {listing.title}
            </h3>
            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {listing.currency} {listing.price.toLocaleString()}
            </p>
            {listing.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <FiMapPin size={12} />
                <span className="line-clamp-1">{listing.location}</span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
