import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin } from 'react-icons/fi';
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
      <Link to={`/listing/${listing.id}`} className="block h-full">
        <div className="h-full flex flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:shadow-glow group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50">
          <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
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
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="line-clamp-2 font-semibold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {listing.title}
            </h3>
            <p className="mt-2 text-lg font-bold text-gradient">
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
