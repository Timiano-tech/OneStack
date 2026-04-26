import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import type { Listing } from '../types';
import { PremiumBadge } from './premium/PremiumBadge';

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
  const isService = listing.category === 'Services';
  const author = listing.author;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group h-full"
    >
      <Link href={`/listing/${listing.id}`} className="block h-full">
        <div className="card h-full flex flex-col p-0 overflow-hidden"
          style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)',
          }}>
          
          {/* Image segment */}
          <div className="relative aspect-4/3 overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
            <img
              src={imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1.5">
              {author?.isVerified && <PremiumBadge tier="pro" size="sm" />}
              {isService && (
                <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Service
                </span>
              )}
            </div>

            {/* Favorite button */}
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onFavoriteToggle(listing.id);
                }}
                className="absolute right-2 bottom-2 rounded-xl p-2 shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.8)', color: isFavorite ? '#ef4444' : '#64748b' }}
              >
                <FiHeart
                  size={18}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            )}

            {/* Price Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black text-white shadow-lg"
              style={{ background: 'var(--primary)', boxShadow: 'var(--shadow-blue)' }}>
               {listing.currency} {listing.price.toLocaleString()}
            </div>
          </div>

          {/* Content segment */}
          <div className="p-3.5 flex flex-col grow">
            <h3 className="line-clamp-1 text-sm font-bold" style={{ color: 'var(--text)' }}>
              {listing.title}
            </h3>
            
            <div className="mt-1.5 flex items-center justify-between">
               {listing.meetupLocation && (
                <p className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <FiMapPin size={10} />
                  <span className="truncate">{listing.meetupLocation}</span>
                </p>
              )}
              {listing.condition && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter"
                  style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                  {listing.condition.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Author info */}
            {author && (
              <div className="mt-auto pt-3 flex items-center gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full" style={{ background: 'var(--primary)' }}>
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                      {author.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
                    {author.fullName}
                  </span>
                  {author.isVerified && <FiCheckCircle size={9} className="text-primary shrink-0" />}
                </div>
                <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Student
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
