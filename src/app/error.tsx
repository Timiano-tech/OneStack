"use client";

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log error securely here without exposing sensitive info
    console.error("Boundary Caught Error:", error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-900/10">
        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Oops, something went wrong!</h2>
        <p className="mb-6 text-sm text-red-800 dark:text-red-200">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-red-600 px-6 py-2.5 font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
