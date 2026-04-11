import type { Metadata } from 'next';
import '../index.css';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'OneStack',
  description: 'OneStack platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
