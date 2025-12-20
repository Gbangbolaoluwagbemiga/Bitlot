'use client';

import dynamic from 'next/dynamic';

const LotteryInterface = dynamic(() => import('@/components/LotteryInterface'), {
  ssr: false,
  loading: () => <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading BitLot...</div>
});

export default function Home() {
  return <LotteryInterface />;
}
