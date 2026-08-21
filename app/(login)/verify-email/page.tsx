'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMsg('No verification token found.'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async res => {
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setStatus('error');
        setMsg(data.error ?? 'Verification failed. The link may have expired.');
      }
    }).catch(() => { setStatus('error'); setMsg('Something went wrong.'); });
  }, [token, router]);

  if (status === 'loading') return (
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
      <p className="text-sm text-gray-500">Verifying your email…</p>
    </div>
  );

  if (status === 'success') return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Email verified!</h2>
      <p className="text-sm text-gray-500">Redirecting to your dashboard…</p>
    </div>
  );

  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <XCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification failed</h2>
      <p className="text-sm text-gray-500 mb-6">{msg}</p>
      <Link href="/sign-in" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading…</div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
