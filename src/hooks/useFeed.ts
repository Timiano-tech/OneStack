import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeedPosts, toggleLike, toggleSavePost } from '../services/feedService';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';

export function useFeed(activeTab: string = 'campus', category: string = 'All') {
  const { user } = useAuth();
  const campusId = (user as any)?.campusId;

  return useInfiniteQuery({
    queryKey: ['feed', activeTab, category, campusId],
    queryFn: async ({ pageParam }) => {
      return getFeedPosts({
        campusId: activeTab === 'campus' ? campusId : undefined,
        category: activeTab === 'categories' ? category : undefined,
        isTrending: activeTab === 'trending',
        cursor: pageParam as string | undefined,
        limit: 10
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}
