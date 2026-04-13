'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getCampusStories, viewStory } from '../../services/storyService';
import type { Story } from '../../types';
import { containerVariants, storyVariants } from '../../lib/animations';

interface StoryGroup {
  userId: string;
  author: { fullName: string; avatarUrl?: string };
  stories: Story[];
  hasUnseen: boolean;
}

export function StoryReel() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const campusId = (user as any).campusId || (user as any).user_metadata?.campus_id;
    if (!campusId) return;

    getCampusStories(campusId, user.id)
      .then((stories) => {
        // Group by userId
        const grouped = stories.reduce<Record<string, StoryGroup>>((acc, story) => {
          const uid = story.userId;
          if (!acc[uid]) {
            acc[uid] = {
              userId: uid,
              author: (story.author as any) || { fullName: 'User' },
              stories: [],
              hasUnseen: false,
            };
          }
          acc[uid].stories.push(story);
          if (!story.hasViewed) acc[uid].hasUnseen = true;
          return acc;
        }, {});

        const sorted = Object.values(grouped).sort((a, b) =>
          Number(b.hasUnseen) - Number(a.hasUnseen)
        );
        setStoryGroups(sorted);
      })
      .catch(console.error);
  }, [user]);

  const openStories = (group: StoryGroup) => {
    setActiveGroup(group);
    setActiveStoryIdx(0);
    setProgress(0);
    setViewerOpen(true);
    if (user && group.stories[0]) {
      viewStory(group.stories[0].id, user.id).catch(console.error);
    }
  };

  useEffect(() => {
    if (!viewerOpen || !activeGroup) return;
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(0);

    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 2;
      });
    }, 100); // 5 seconds total (2% per 100ms)

    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, activeStoryIdx, activeGroup]);

  const goNext = () => {
    if (!activeGroup) return;
    if (activeStoryIdx < activeGroup.stories.length - 1) {
      const nextIdx = activeStoryIdx + 1;
      setActiveStoryIdx(nextIdx);
      if (user) viewStory(activeGroup.stories[nextIdx].id, user.id).catch(console.error);
    } else {
      // Try next group
      const groupIdx = storyGroups.findIndex((g) => g.userId === activeGroup.userId);
      if (groupIdx < storyGroups.length - 1) {
        openStories(storyGroups[groupIdx + 1]);
      } else {
        setViewerOpen(false);
      }
    }
  };

  const goPrev = () => {
    if (activeStoryIdx > 0) {
      setActiveStoryIdx((i) => i - 1);
    }
  };

  const currentStory = activeGroup?.stories[activeStoryIdx];

  return (
    <>
      {/* Story Bar */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <motion.div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Add Story */}
          <motion.div variants={storyVariants} className="flex flex-col items-center gap-1.5 shrink-0">
            <Link href="/stories/create">
              <div
                className="relative h-14 w-14 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'var(--primary-muted)', border: '2px dashed var(--primary)' }}
              >
                {user && (user as any).user_metadata?.avatar_url ? (
                  <img
                    src={(user as any).user_metadata.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover opacity-60"
                  />
                ) : null}
                <div
                  className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  <FiPlus size={12} />
                </div>
              </div>
            </Link>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Add
            </span>
          </motion.div>

          {/* Story Circles */}
          {storyGroups.map((group) => (
            <motion.div
              key={group.userId}
              variants={storyVariants}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
              onClick={() => openStories(group)}
              whileTap={{ scale: 0.94 }}
            >
              <div className={group.hasUnseen ? 'story-ring' : 'story-ring-seen'}>
                <div
                  className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: 'var(--surface-elevated)', border: '2px solid var(--surface)' }}
                >
                  {group.author.avatarUrl ? (
                    <img src={group.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {group.author.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span
                className="max-w-[56px] truncate text-[10px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {group.author.fullName.split(' ')[0]}
              </span>
            </motion.div>
          ))}

          {storyGroups.length === 0 && (
            <div className="flex items-center px-2 py-1">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No campus stories yet. Be the first!
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewerOpen && currentStory && activeGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
              {activeGroup.stories.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                >
                  <div
                    className="h-full rounded-full transition-none"
                    style={{
                      background: 'white',
                      width: i < activeStoryIdx ? '100%' : i === activeStoryIdx ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-white/20">
                  {activeGroup.author.avatarUrl ? (
                    <img src={activeGroup.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white font-bold">
                      {activeGroup.author.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{activeGroup.author.fullName}</p>
                  <p className="text-[11px] text-white/70">
                    {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Media */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentStory.id}
                src={currentStory.mediaUrl}
                alt=""
                className="h-full w-full object-contain"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Caption */}
            {currentStory.caption && (
              <div className="absolute bottom-16 left-0 right-0 px-6">
                <p className="text-center text-white text-sm font-medium drop-shadow-lg">
                  {currentStory.caption}
                </p>
              </div>
            )}

            {/* Tap zones */}
            <button
              className="absolute left-0 top-0 h-full w-1/3 z-20"
              onClick={goPrev}
              aria-label="Previous story"
            />
            <button
              className="absolute right-0 top-0 h-full w-1/3 z-20"
              onClick={goNext}
              aria-label="Next story"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
