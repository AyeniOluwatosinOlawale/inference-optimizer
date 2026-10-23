import { DeveloperSection } from '../benchmarks/llm/developer-section';
import { Code2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Developer Portal - AnaModel API',
};

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-[#16213E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Code2 className="w-4 h-4" />
            AnaModel · Developer Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
            Integrate AnaModel into your app
          </h1>
          <p className="text-base text-slate-300 max-w-2xl">
            Replaces the OpenAI SDK. Change the base URL, keep your existing code. Live web search, tool use, and streaming included.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/benchmarks/llm"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Benchmarks
        </Link>

        <DeveloperSection />

        {/* What you get */}
        <div className="rounded-xl bg-[#16213E] text-white p-6">
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">What your users get</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Chat',              'Q&A, writing, code help, explanations'],
              ['Live web search',   'Runs when the question needs current data. No cutoff date.'],
              ['Agentic actions',   'GitHub, Stripe, Supabase, Slack and more. Paste the token in chat.'],
              ['Goal execution',    'Give it a goal. It plans the steps, runs them, and streams progress.'],
              ['Weather & crypto',  'Live data via open APIs. No key needed.'],
              ['Python execution',  'Run code, analyse data, compute results inline'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-teal-400 mt-0.5 shrink-0">→</span>
                <p className="text-sm"><span className="font-semibold text-white">{title}. </span>
                  <span className="text-slate-400">{desc}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
