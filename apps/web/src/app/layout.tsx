import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import './globals.css';

export const metadata = {
  title: 'Fitness Platform',
  description: 'Your comprehensive fitness tracking platform',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}