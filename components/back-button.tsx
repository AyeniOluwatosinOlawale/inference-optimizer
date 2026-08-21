'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton({ fallback = '/dashboard' }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => window.history.length > 1 ? router.back() : router.push(fallback)}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
