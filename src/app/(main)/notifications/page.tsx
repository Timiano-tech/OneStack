'use client';

import { Suspense } from 'react';
import { Notification as NotifView } from '../../../views/Notifications';

export default function NotificationsPage() {
  return (
    <Suspense>
      <NotifView />
    </Suspense>
  );
}
