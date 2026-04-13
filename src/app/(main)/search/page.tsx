'use client';

import { Suspense } from 'react';
import { Search as SearchView } from '../../../views/Search';

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
