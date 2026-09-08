import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VedicNeev — JNVST, AISSEE & RMS Entrance Foundation',
  description: 'Institutional-grade gateway for entrance exam preparation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-955 antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
