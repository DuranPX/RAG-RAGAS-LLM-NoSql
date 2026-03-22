import React from 'react';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SpotiAnalytics — Tu Música, Tus Datos',
  description: 'Aplicación de análisis musical inteligente con RAG y NoSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#0f0f1a] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
