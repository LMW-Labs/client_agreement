'use client';

import dynamic from 'next/dynamic';

const AgreementForm = dynamic(() => import('@/components/AgreementForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  ),
});

export default function Home() {
  return <AgreementForm />;
}
