import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'PREDEM | SmartFoncier Douala',
  description: 'Plateforme officielle de déclaration d\'aliénation immobilière — Ville de Douala, Cameroun',
  keywords: ['predem', 'immobilier', 'douala', 'cameroun', 'foncier', 'attestation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(15,31,26,0.12)',
            },
            success: { iconTheme: { primary: '#007A5E', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
