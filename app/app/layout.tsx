'use client';

import Nav from '@/components/Nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex">
      <Nav />
      <main className="flex-1 md:ml-0">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
