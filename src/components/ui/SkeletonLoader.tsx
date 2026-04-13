'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function PostCardSkeleton() {
  return (
    <div className="card rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-xl" />
      {/* Actions */}
      <div className="flex gap-6 pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card rounded-2xl overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" style={{ borderRadius: 0 }} />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div style={{ background: 'var(--surface)' }}>
      <Skeleton className="h-44 w-full rounded-none" style={{ borderRadius: 0 }} />
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-10">
          <Skeleton className="h-[88px] w-[88px] rounded-2xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
          <div className="flex gap-6 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ChatRoomSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function StoryReelSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
