import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, DollarSign, BarChart3, Shield, GitBranch, Layers } from 'lucide-react';
import Link from 'next/link';
import { Terminal } from './terminal';
import SavingsCalcClient from './savings-calc';

const BENCHMARKS = [
  { label: 'Parallel execution', result: '3.87×', unit: 'faster workflows' },
  { label: 'Prompt caching',     result: '61.4%', unit: 'cost reduction'   },
  { label: 'Model routing',      result: '64.3%', unit: 'cheaper per call' },
  { label: 'Concurrency',        result: '14×',   unit: 'throughput'       },
];

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Intelligent Model Routing',
    desc: 'Automatically route simple tasks to cheaper models and complex reasoning to frontier models. Pay for what you actually need.',
  },
  {
    icon: Zap,
    title: 'Parallel Execution',
    desc: 'Execute independent LLM requests simultaneously. 3.87× faster multi-call workflows without touching your application logic.',
  },
  {
    icon: Layers,
    title: 'Prompt Caching',
    desc: 'Reuse repeated context across requests. Identical or similar prompts served from cache at near-zero cost.',
  },
  {
    icon: BarChart3,
    title: 'Inference Observability',
    desc: 'Track TTFT, TPOT, throughput, cost per request, cache-hit rate and model usage across every call in real time.',
  },
  {
    icon: DollarSign,
    title: 'Token Compression',
    desc: 'Automatically compress verbose system prompts before sending. Reduce input token spend by up to 47% on repeated context.',
  },
  {
    icon: Shield,
    title: 'Reliability Layer',
    desc: 'Automatic retries, TTFT-based fallbacks, rate-limit handling and provider failover. Your AI calls never go cold.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Get your gateway key', desc: 'Sign up, create a project, copy your key. Under 60 seconds.' },
  { step: '02', title: 'Change one line', desc: 'Point your existing Anthropic/OpenAI client at the gateway URL. Nothing else changes.' },
  { step: '03', title: 'We optimise every request', desc: '13 optimisations applied automatically: routing, caching, compression, fallback and more.' },
  { step: '04', title: 'Track your savings', desc: 'Open the dashboard. See exactly how much we saved you today, this week, this month.' },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 text-xs font-medium text-orange-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                13 optimisations · works with Claude, GPT &amp; Gemini
              </div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl leading-tight">
                Make Your LLM APIs
                <span className="block text-orange-500">Faster. Cheaper.</span>
                <span className="block">Automatically.</span>
              </h1>
              <p className="mt-5 text-base text-gray-500 sm:text-lg lg:text-xl max-w-xl lg:mx-0 sm:mx-auto">
                Route, cache and optimise your AI inference across Claude, GPT and Gemini.
                One line of code. Measurable savings from day one.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center lg:justify-start">
                <Link href="/sign-up">
                  <Button size="lg" className="rounded-full text-base px-6 bg-orange-500 hover:bg-orange-600 text-white">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/benchmarks">
                  <Button size="lg" variant="outline" className="rounded-full text-base px-6">
                    View Benchmarks
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">No credit card required · 1,000 requests/day free</p>
            </div>
            <div className="mt-14 lg:mt-0 lg:col-span-6">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── Benchmark strip ───────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500 mb-10">
            Real benchmark results, measured not estimated
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {BENCHMARKS.map(b => (
              <div key={b.label}>
                <div className="text-4xl font-bold text-orange-500">{b.result}</div>
                <div className="text-sm text-gray-300 font-medium mt-1">{b.unit}</div>
                <div className="text-xs text-gray-500 mt-0.5">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">One gateway. Every provider.</h2>
          <p className="text-gray-500 mb-12 text-lg">All optimisations apply regardless of which LLM sits behind the gateway.</p>
          <div className="bg-gray-950 rounded-2xl p-8 font-mono text-sm text-left overflow-x-auto border border-gray-800">
            <pre className="text-gray-300 leading-relaxed whitespace-pre">{`              YOUR APPLICATION
                     │
                     ▼
       ┌─────────────────────────┐
       │   INFERENCE OPTIMIZER   │
       │  ✓ Route   ✓ Cache      │
       │  ✓ Compress ✓ Parallel  │
       │  ✓ Fallback ✓ Observe   │
       └────────────┬────────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
  Claude          GPT          Gemini
Haiku/Opus     4o/mini       Pro/Flash`}</pre>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Connect. Optimise. Save.</h2>
            <p className="text-gray-500 mt-3 text-lg">No rewrite required. Works with any OpenAI-compatible client.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(h => (
              <div key={h.step}>
                <div className="text-5xl font-black text-orange-100 mb-3">{h.step}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">13 optimisations. Zero config.</h2>
            <p className="text-gray-500 mt-3 text-lg">Every request passes through the full stack automatically.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <f.icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Savings calculator ────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">How much are you wasting?</h2>
          <p className="text-gray-400 mb-10 text-lg">Enter your current spend. We&apos;ll show you what we&apos;d save.</p>
          <SavingsCalcClient />
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stop treating LLM costs as fixed.
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Optimise your inference. The savings are real and measurable from request one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full text-base px-8 bg-orange-500 hover:bg-orange-600 text-white">
                Start Optimising Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-full text-base px-8">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
