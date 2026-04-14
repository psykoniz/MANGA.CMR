import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'PREDEM | SmartFoncier Douala',
  description: 'Plateforme de déclaration d\'aliénation immobilière - Ville de Douala, Cameroun',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
