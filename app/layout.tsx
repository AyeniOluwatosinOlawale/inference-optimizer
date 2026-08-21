import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Inference Optimizer: Make Your LLM APIs Faster. Cheaper. Automatically.',
  description: 'Route, cache and optimise your AI inference across Claude, GPT and Gemini. 13 optimisations. One line of code. Measurable savings from day one.',
  keywords: ['LLM', 'AI inference', 'Claude', 'OpenAI', 'cost optimisation', 'API gateway', 'model routing'],
  openGraph: {
    title: 'Inference Optimizer',
    description: 'Make Your LLM APIs Faster. Cheaper. Automatically.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
