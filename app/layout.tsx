import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Second Brain — Personal Dashboard',
  description: 'Your personal knowledge management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-950 text-slate-100 antialiased">
        <Sidebar />
        <main
          style={{ marginLeft: 'var(--sidebar-w)' }}
          className="min-h-screen p-6 lg:p-8"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
