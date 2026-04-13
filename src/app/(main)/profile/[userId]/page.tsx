'use client';

import { Suspense } from 'react';
import { Profile } from '../../../../views/Profile';

export default function UserProfilePage() {
  return (
    <Suspense>
      <Profile />
    </Suspense>
  );
}
