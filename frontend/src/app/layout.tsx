import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'StudySprint OS',
  description: 'Your complete student operating system for learning, practice, and performance improvement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#fff',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
