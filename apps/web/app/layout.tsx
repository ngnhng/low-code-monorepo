import './globals.css';
import '../styles/dsg.css'

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MobxStoreProvider } from 'lib/mobx/store-provider';
import { AppProvider } from 'lib/app-provider';

export const metadata: Metadata = {
  title: 'Low-code Platform',
  description: '',
};

const font = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <html lang="en">
        <body className={font.className}>
          <MobxStoreProvider>
            <AppProvider>{children}</AppProvider>
          </MobxStoreProvider>
        </body>
      </html>
    </>
  );
}
