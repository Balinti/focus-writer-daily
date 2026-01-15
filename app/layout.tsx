import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Focus Writer Daily - 30-Day First Draft Program',
  description: 'A momentum-based draft-finishing companion that runs a 30-day first-draft program with daily micro-deliverables and guilt-free recalibration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
