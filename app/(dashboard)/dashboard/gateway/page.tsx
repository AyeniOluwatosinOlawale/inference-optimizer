'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, TrendingUp, Zap, Activity, Plus, X, Trash2, Copy, Check, Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ── Real-time SSE hook ────────────────────────────────────────────────────────
function useRealtimeRequests(initialLastId: number) {
  const [liveRows, setLiveRows] = useState<any[]>([]);
  const [flashIds, setFlashIds] = useState<Set<number>>(new Set());
  const lastIdRef = useRef(initialLastId);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`/api/gateway/stream?last_id=${lastIdRef.current}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const rows: any[] = JSON.parse(e.data);
        if (!rows.length) return;
        lastIdRef.current = Math.max(lastIdRef.current, ...rows.map(r => r.id));
        setLiveRows(prev => {
          const seen = new Set(prev.map((r: any) => r.id));
          const fresh = rows.filter(r => !seen.has(r.id));
          return fresh.length ? [...fresh.reverse(), ...prev] : prev;
        });
        setFlashIds(prev => {
          const next = new Set([...prev, ...rows.map(r => r.id)]);
          setTimeout(() => setFlashIds(p => { const s = new Set(p); rows.forEach(r => s.delete(r.id)); return s; }), 1800);
          return next;
        });
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      setTimeout(connect, 1500);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => esRef.current?.close();
  }, [connect]);

  return { liveRows, flashIds };
}

const fmt$ = (v: number | string) => {
  const n = Number(v);
  if (isNaN(n)) return '$0.0000';
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.0001) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ── Savings Story — the hero comparison widget ────────────────────────────────
function SavingsStory({ summary, loading }: { summary: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-pulse h-28" />
    );
  }
  if (!summary || summary.total_requests === 0) return null;

  const baseline = summary.total_baseline_usd as number;
  const actual = summary.total_cost_usd as number;
  const saved = summary.total_savings_usd as number;
  const pct = summary.savings_pct as number;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center gap-6"
    >
      {/* Without optimizer */}
      <div className="text-center sm:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Without optimizer</p>
        <p className="text-3xl font-mono font-bold text-gray-300 line-through decoration-gray-300">
          {fmt$(baseline)}
        </p>
        <p className="text-xs text-gray-400 mt-1">What you would have paid</p>
      </div>

      <ArrowRight className="w-6 h-6 text-emerald-400 flex-shrink-0 hidden sm:block" />

      {/* With optimizer */}
      <div className="text-center sm:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">With optimizer</p>
        <p className="text-3xl font-mono font-bold text-gray-900">{fmt$(actual)}</p>
        <p className="text-xs text-gray-500 mt-1">What you actually paid</p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-12 w-px bg-gray-100 mx-2" />

      {/* Savings badge — the hero number */}
      <div className="sm:ml-auto text-center bg-emerald-50 border border-emerald-100 rounded-2xl px-8 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500 mb-1">You saved</p>
        <p className="text-4xl font-mono font-bold text-emerald-600 leading-none">{fmt$(saved)}</p>
        <p className="text-sm font-semibold text-emerald-500 mt-1">{pct.toFixed(1)}% reduction</p>
      </div>
    </motion.div>
  );
}

const PROVIDERS: Record<string, { label: string; icon: string }> = {
  anthropic:       { label: 'Anthropic', icon: '🟤' },
  openai:          { label: 'OpenAI', icon: '🟢' },
  gemini:          { label: 'Google Gemini', icon: '🔵' },
  groq:            { label: 'Groq', icon: '🟣' },
  openrouter:      { label: 'OpenRouter', icon: '🔶' },
  'openai-compat': { label: 'OpenAI-compat', icon: '⚙️' },
};

const MODEL_SHORT: Record<string, string> = {
  'claude-haiku-4-5': 'Haiku',
  'claude-sonnet-4-6': 'Sonnet',
  'claude-opus-4-7': 'Opus',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o-mini',
  'gemini-2.0-flash': 'Flash',
  'gemini-2.5-pro': 'Gemini Pro',
  'llama-3.3-70b-versatile': 'Llama 70B',
  'llama-3.1-8b-instant': 'Llama 8B',
};

function KpiCard({ label, value, sub, icon: Icon, color, delay = 0 }: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

function OptPill({ label }: { label: string }) {
  const colors: Record<string, string> = {
    routing: 'bg-green-50 text-green-700',
    prompt_caching: 'bg-blue-50 text-blue-700',
    coalescing: 'bg-amber-50 text-amber-700',
    fallback: 'bg-purple-50 text-purple-700',
    early_stopping: 'bg-rose-50 text-rose-700',
  };
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${colors[label] ?? 'bg-gray-100 text-gray-600'}`}>
      {label.replace('_', ' ')}
    </span>
  );
}

function CostChart({ days }: { days: number }) {
  const { data, isLoading } = useSWR(`/api/gateway/timeseries?days=${days}`, fetcher, { refreshInterval: 30000 });
  const rows: any[] = data?.data ?? [];

  if (isLoading) {
    return <div className="h-48 flex items-center justify-center text-sm text-gray-400 animate-pulse">Loading chart…</div>;
  }
  if (rows.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No data yet — chart will appear after your first requests.
      </div>
    );
  }

  const formatted = rows.map(r => ({
    date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    'Without optimizer': parseFloat(r.baseline.toFixed(6)),
    'With optimizer': parseFloat(r.cost.toFixed(6)),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%" barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${Number(v).toFixed(4)}`} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: any, name: any) => [fmt$(Number(v)), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="Without optimizer" fill="#d1d5db" radius={[3, 3, 0, 0]} />
        <Bar dataKey="With optimizer" fill="#10b981" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const MODEL_COLORS: Record<string, string> = {
  'claude-haiku-4-5':         '#10b981',
  'claude-sonnet-4-6':        '#3b82f6',
  'claude-opus-4-7':          '#8b5cf6',
  'gpt-4o-mini':              '#f59e0b',
  'gpt-4o':                   '#f97316',
  'gemini-2.0-flash':         '#06b6d4',
  'gemini-2.5-pro':           '#0ea5e9',
  'llama-3.1-8b-instant':     '#ec4899',
  'llama-3.3-70b-versatile':  '#d946ef',
};
const FALLBACK_COLORS = ['#6366f1','#14b8a6','#f43f5e','#84cc16','#fb923c'];

function ModelDonut({ distribution }: { distribution: Record<string, number> }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return <div className="h-40 flex items-center justify-center text-xs text-gray-400">No data yet</div>;

  const entries = Object.entries(distribution).sort(([, a], [, b]) => b - a);
  const data = entries.map(([model, count]) => ({
    name: MODEL_SHORT[model] ?? model,
    value: count,
    pct: ((count / total) * 100).toFixed(1),
  }));

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={130} height={130}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
            dataKey="value" paddingAngle={2} strokeWidth={0}>
            {entries.map(([model], i) => (
              <Cell key={model} fill={MODEL_COLORS[model] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e5e7eb' }}
            formatter={(v: any, _: any, p: any) => [`${p.payload.pct}% (${v} req)`, p.payload.name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-1.5 min-w-0">
        {entries.slice(0, 6).map(([model, count], i) => (
          <li key={model} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: MODEL_COLORS[model] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
            <span className="text-gray-600 truncate flex-1">{MODEL_SHORT[model] ?? model}</span>
            <span className="text-gray-400">{((count / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const OPT_LABELS: Record<string, string> = {
  routing:        'Smart Routing',
  prompt_caching: 'Prompt Cache',
  coalescing:     'Dedup/Coalesce',
  fallback:       'Fallback',
  early_stopping: 'Early Stop',
};

function OptBreakdown({ breakdown }: { breakdown: Record<string, { count: number; savings: number }> }) {
  const rows = Object.entries(breakdown).sort(([, a], [, b]) => b.savings - a.savings);
  if (rows.length === 0) return <div className="text-xs text-gray-400 py-4 text-center">No optimizations logged yet</div>;
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-400 uppercase tracking-wide border-b border-gray-100">
          <th className="text-left pb-2 font-medium">Optimization</th>
          <th className="text-right pb-2 font-medium">Requests</th>
          <th className="text-right pb-2 font-medium">Saved</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([opt, { count, savings }]) => (
          <tr key={opt} className="border-b border-gray-50">
            <td className="py-2">
              <OptPill label={opt} />
              <span className="ml-2 text-gray-500">{OPT_LABELS[opt] ?? opt}</span>
            </td>
            <td className="py-2 text-right text-gray-600">{count.toLocaleString()}</td>
            <td className="py-2 text-right font-semibold text-emerald-600">+{fmt$(savings)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Day-grouped request log ───────────────────────────────────────────────────

const ukDayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'short', day: 'numeric' });
const ukDayKey = (d: Date) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  return `${p.find(x => x.type === 'year')!.value}-${p.find(x => x.type === 'month')!.value}-${p.find(x => x.type === 'day')!.value}`;
};
const todayKey = ukDayKey(new Date());

interface DayTotals {
  key: string;
  label: string;
  requests: any[];
  count: number;
  tokens: number;
  cost: number;
  savings: number;
  baseline: number;
  cacheHits: number;
  ttfts: number[];
  throughputs: number[];
  models: Set<string>;
}

function computeDayGroups(rows: any[]): DayTotals[] {
  const map = new Map<string, DayTotals>();
  for (const r of rows) {
    const date = new Date(r.createdAt ?? r.created_at);
    const key = ukDayKey(date);
    if (!map.has(key)) {
      map.set(key, { key, label: ukDayFmt.format(date), requests: [], count: 0, tokens: 0, cost: 0, savings: 0, baseline: 0, cacheHits: 0, ttfts: [], throughputs: [], models: new Set() });
    }
    const g = map.get(key)!;
    g.requests.push(r);
    g.count++;
    g.tokens += (r.inputTokens ?? r.input_tokens ?? 0) + (r.outputTokens ?? r.output_tokens ?? 0);
    g.cost += parseFloat(String(r.costUsd ?? r.cost_usd ?? 0));
    g.savings += parseFloat(String(r.savingsUsd ?? r.savings_usd ?? 0));
    g.baseline += parseFloat(String(r.baselineCostUsd ?? r.baseline_cost_usd ?? 0));
    if (r.fromCache ?? r.from_cache) g.cacheHits++;
    const ttft = r.ttftMs ?? r.ttft_ms;
    if (ttft) g.ttfts.push(ttft);
    const total = r.totalMs ?? r.total_ms ?? 0;
    const outTok = r.outputTokens ?? r.output_tokens ?? 0;
    const decodeMs = total - (ttft ?? 0);
    if (decodeMs > 0 && outTok > 0) g.throughputs.push((outTok / decodeMs) * 1000);
    const used = r.modelUsed ?? r.model_used;
    if (used) g.models.add(MODEL_SHORT[used] ?? used);
  }
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function RequestRow({ r, flash }: { r: any; flash: boolean }) {
  const reqModel = MODEL_SHORT[r.modelRequested ?? r.model_requested] ?? (r.modelRequested ?? r.model_requested);
  const usedModel = MODEL_SHORT[r.modelUsed ?? r.model_used] ?? (r.modelUsed ?? r.model_used);
  const routed = reqModel !== usedModel;
  const savings = parseFloat(String(r.savingsUsd ?? r.savings_usd ?? 0));
  const cost = parseFloat(String(r.costUsd ?? r.cost_usd ?? 0));
  const opts: string[] = (() => {
    const raw = r.optimizations ?? [];
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
    return raw;
  })();
  const ttft = r.ttftMs ?? r.ttft_ms ?? 0;
  const total = r.totalMs ?? r.total_ms ?? 0;
  const outTok = r.outputTokens ?? r.output_tokens ?? 0;
  const decodeMs = total - ttft;
  const tpot = decodeMs > 0 && outTok > 0 ? decodeMs / outTok : null;
  const throughput = decodeMs > 0 && outTok > 0 ? (outTok / decodeMs) * 1000 : null;
  const savingsPct = savings > 0 && (cost + savings) > 0 ? (savings / (cost + savings)) * 100 : 0;

  return (
    <motion.tr
      key={r.id}
      initial={{ opacity: 0, backgroundColor: flash ? '#d1fae5' : 'transparent' }}
      animate={{ opacity: 1, backgroundColor: 'transparent' }}
      transition={{ opacity: { duration: 0.25 }, backgroundColor: { duration: 1.8 } }}
      className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors group"
    >
      <td className="pl-10 pr-4 py-3 text-gray-400 text-xs whitespace-nowrap w-32">
        {new Date(r.createdAt ?? r.created_at).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400">{reqModel}</span>
          {routed && (<><span className="text-gray-300">→</span><span className="font-semibold text-gray-800 bg-emerald-50 px-1.5 py-0.5 rounded">{usedModel}</span></>)}
          {!routed && <span className="font-semibold text-gray-700">{usedModel}</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-xs text-gray-500">
        {((r.inputTokens ?? r.input_tokens ?? 0) + outTok).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right text-xs font-medium text-gray-900">
        {(r.fromCache ?? r.from_cache) ? <span className="text-emerald-600 font-semibold">Free</span> : fmt$(cost)}
      </td>
      <td className="px-4 py-3 text-right text-xs">
        {savings > 0 ? (
          <span className="font-semibold text-emerald-600">+{fmt$(savings)}</span>
        ) : <span className="text-gray-300">—</span>}
        {savingsPct > 0 && <div className="text-[10px] text-emerald-400">{savingsPct.toFixed(0)}%</div>}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">{opts.map(o => <OptPill key={o} label={o} />)}</div>
      </td>
      <td className="px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
        <div>{ttft ? `${ttft}ms TTFT` : total ? `${total}ms` : '—'}</div>
        {tpot !== null && <div className="text-gray-400">{tpot.toFixed(1)}ms/tok</div>}
        {throughput !== null && <div className="text-emerald-500 font-medium">{throughput.toFixed(1)} tok/s</div>}
      </td>
    </motion.tr>
  );
}

function DayGroup({ group, defaultOpen, flashIds }: { group: DayTotals; defaultOpen: boolean; flashIds: Set<number> }) {
  const [open, setOpen] = useState(defaultOpen);
  const avgTtft = group.ttfts.length ? Math.round(group.ttfts.reduce((a, b) => a + b, 0) / group.ttfts.length) : null;
  const avgThroughput = group.throughputs.length ? group.throughputs.reduce((a, b) => a + b, 0) / group.throughputs.length : null;
  const savingsPct = group.baseline > 0 ? (group.savings / group.baseline) * 100 : 0;
  const cacheRate = group.count > 0 ? (group.cacheHits / group.count) * 100 : 0;
  const isToday = group.key === todayKey;

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Day header — clickable */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />

        {/* Date + today badge */}
        <div className="flex items-center gap-2 w-32 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">{group.label}</span>
          {isToday && <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Today</span>}
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
          <span className="text-xs text-gray-500">{group.count} req</span>
          <span className="text-xs text-gray-400">{group.tokens.toLocaleString()} tok</span>
          <span className="text-xs font-medium text-gray-700">{fmt$(group.cost)}</span>
          {group.savings > 0 && (
            <span className="text-xs font-semibold text-emerald-600">
              +{fmt$(group.savings)} saved
              <span className="ml-1 text-emerald-400 font-normal">({savingsPct.toFixed(0)}%)</span>
            </span>
          )}
          {cacheRate > 0 && <span className="text-xs text-violet-500">{cacheRate.toFixed(0)}% cached</span>}
          {avgTtft && <span className="text-xs text-gray-400">avg {avgTtft}ms</span>}
          {avgThroughput && <span className="text-xs text-gray-400">{avgThroughput.toFixed(0)} tok/s avg</span>}
        </div>

        {/* Model badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from(group.models).slice(0, 4).map(m => (
            <span key={m} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{m}</span>
          ))}
        </div>
      </button>

      {/* Expanded rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto bg-gray-50/30">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pl-10 pr-4 py-2 text-left font-medium w-32">Time</th>
                    <th className="px-4 py-2 text-left font-medium">Route</th>
                    <th className="px-4 py-2 text-right font-medium">Tokens</th>
                    <th className="px-4 py-2 text-right font-medium">Cost</th>
                    <th className="px-4 py-2 text-right font-medium">Saved</th>
                    <th className="px-4 py-2 text-left font-medium">Optimizations</th>
                    <th className="px-4 py-2 text-right font-medium">Latency / Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {group.requests.map(r => (
                    <RequestRow key={r.id} r={r} flash={flashIds.has(r.id)} />
                  ))}
                </tbody>
                {/* Day summary footer */}
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                    <td className="pl-10 pr-4 py-2.5" colSpan={2}>Day total — {group.count} requests</td>
                    <td className="px-4 py-2.5 text-right">{group.tokens.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">{fmt$(group.cost)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600">{group.savings > 0 ? `+${fmt$(group.savings)}` : '—'}</td>
                    <td className="px-4 py-2.5">
                      {cacheRate > 0 && <span className="text-violet-500">{cacheRate.toFixed(0)}% cache hit</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-400">
                      {avgTtft ? `${avgTtft}ms avg` : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayGroupedLog({ requests, loading, flashIds }: { requests: any[]; loading: boolean; flashIds: Set<number> }) {
  const groups = computeDayGroups(requests);
  return (
    <div>
      {loading ? (
        <div className="space-y-px">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-50">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-gray-400">
          No requests yet — send traffic through the gateway to see it here.
        </div>
      ) : (
        groups.map((g, i) => <DayGroup key={g.key} group={g} defaultOpen={i === 0} flashIds={flashIds} />)
      )}
    </div>
  );
}

function GatewayKeysPanel({
  newKey, setNewKey,
}: {
  newKey: string | null;
  setNewKey: (k: string | null) => void;
}) {
  const { data: keys = [], mutate, isLoading } = useSWR<any[]>('/api/gateway/keys', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [editingCapId, setEditingCapId] = useState<number | null>(null);
  const [capInput, setCapInput] = useState('');

  const handleSaveCap = async (id: number) => {
    const val = capInput.trim();
    await fetch(`/api/gateway/keys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_spend_limit_usd: val === '' ? null : parseFloat(val) }),
    });
    setEditingCapId(null);
    mutate();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/gateway/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null }),
      });
      const data = await res.json();
      setNewKey(data.key);
      setName('');
      setShowForm(false);
      mutate();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: number) => {
    setRevoking(id);
    try {
      await fetch(`/api/gateway/keys/${id}`, { method: 'DELETE' });
      mutate();
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Gateway API Keys</h2>
          <p className="text-xs text-gray-400 mt-0.5">Bearer tokens for calling the gateway — generate one per app or environment</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setNewKey(null); }}
          className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Generate key'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="create-key-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreate}
            className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-end gap-3 overflow-hidden"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. Production, My App"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {submitting ? 'Generating…' : 'Generate'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newKey && (
          <motion.div
            key="new-key-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 overflow-hidden"
          >
            <p className="text-xs font-medium text-emerald-800 mb-2">
              Key generated — copy it now. It won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 overflow-x-auto">
                {showKey ? newKey : newKey.slice(0, 8) + '•'.repeat(20)}
              </code>
              <button onClick={() => setShowKey(v => !v)} className="text-emerald-600 hover:text-emerald-800 transition-colors p-1">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setNewKey(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>
      ) : keys.length === 0 && !showForm ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          No gateway keys yet. Generate one to start routing traffic.
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {keys.map((k: any) => (
            <li key={k.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{k.name ?? 'Unnamed key'}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{k.keyPrefix}{'•'.repeat(12)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {editingCapId === k.id ? (
                  <>
                    <span className="text-gray-400">$</span>
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 5.00"
                      value={capInput}
                      onChange={e => setCapInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveCap(k.id); if (e.key === 'Escape') setEditingCapId(null); }}
                      className="w-20 border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900/10"
                    />
                    <button onClick={() => handleSaveCap(k.id)} className="text-emerald-600 hover:text-emerald-800 font-medium px-1">Save</button>
                    <button onClick={() => setEditingCapId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingCapId(k.id); setCapInput(k.dailySpendLimitUsd != null ? String(k.dailySpendLimitUsd) : ''); }}
                    className="text-gray-400 hover:text-gray-700 whitespace-nowrap"
                    title="Set daily spend cap"
                  >
                    {k.dailySpendLimitUsd != null ? `Cap $${k.dailySpendLimitUsd}/day` : 'No cap'}
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-300 whitespace-nowrap hidden sm:block">
                {new Date(k.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleRevoke(k.id)}
                disabled={revoking === k.id}
                className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {revoking === k.id ? 'Revoking…' : 'Revoke'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProviderKeysPanel() {
  const { data: keys = [], mutate, isLoading } = useSWR<any[]>('/api/provider-keys', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ provider: 'anthropic', api_key: '', base_url: '', name: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/provider-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.provider,
          api_key: form.api_key,
          base_url: form.base_url || undefined,
          name: form.name || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save key');
      }
      setForm({ provider: 'anthropic', api_key: '', base_url: '', name: '' });
      setShowForm(false);
      mutate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    setRevoking(id);
    try {
      await fetch(`/api/provider-keys/${id}`, { method: 'DELETE' });
      mutate();
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Provider Keys</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your API keys — encrypted at rest, used by the gateway on your behalf</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); }}
          className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add key'}
        </button>
      </div>

      <AnimatePresence>
      {showForm && (
        <motion.form
          key="add-key-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleAdd}
          className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 space-y-4 overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
              <select
                value={form.provider}
                onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                {Object.entries(PROVIDERS).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. Production OpenAI"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type="password"
              required
              placeholder="sk-ant-... / sk-... / AIza..."
              value={form.api_key}
              onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 font-mono"
            />
          </div>
          {(form.provider === 'openai-compat' || form.provider === 'openrouter') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base URL</label>
              <input
                type="url"
                required
                placeholder={form.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://your-endpoint/v1'}
                value={form.base_url || (form.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : '')}
                onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 font-mono"
              />
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : 'Save key'}
          </button>
        </motion.form>
      )}
      </AnimatePresence>

      {isLoading ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>
      ) : keys.length === 0 && !showForm ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">No provider keys yet. Add your first key to start routing traffic.</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {keys.map((k: any) => (
            <li key={k.id} className="flex items-center gap-4 px-6 py-4">
              <span className="text-lg">{PROVIDERS[k.provider]?.icon ?? '🔑'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{PROVIDERS[k.provider]?.label ?? k.provider}</span>
                  {k.name && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{k.name}</span>}
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {k.keyHint ?? k.key_hint}
                  {k.baseUrl && <span className="ml-2 text-gray-300">· {k.baseUrl}</span>}
                </p>
              </div>
              <span className="text-xs text-gray-300 whitespace-nowrap hidden sm:block">
                {new Date(k.createdAt ?? k.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleRevoke(k.id)}
                disabled={revoking === k.id}
                className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {revoking === k.id ? 'Revoking…' : 'Revoke'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const GATEWAY_URL = 'https://claude-gateway-production-e695.up.railway.app/v1';
const GATEWAY_BASE  = 'https://claude-gateway-production-e695.up.railway.app';

// Per-provider config: default model, provider param, routing note
const PROVIDER_SNIPPET_CONFIG: Record<string, {
  label: string;
  icon: string;
  model: string;
  providerParam: string;
  routesTo: string;
}> = {
  anthropic:    { label: 'Claude',      icon: '🟤', model: 'claude-opus-4-7',         providerParam: 'anthropic',    routesTo: 'claude-haiku-4-5' },
  openai:       { label: 'OpenAI',      icon: '🟢', model: 'gpt-4o',                  providerParam: 'openai',       routesTo: 'gpt-4o-mini' },
  gemini:       { label: 'Gemini',      icon: '🔵', model: 'gemini-1.5-pro',          providerParam: 'gemini',       routesTo: 'gemini-1.5-flash' },
  groq:         { label: 'Groq',        icon: '🟣', model: 'llama-3.1-70b-versatile', providerParam: 'groq',         routesTo: 'llama-3.1-8b-instant' },
  openrouter:   { label: 'OpenRouter',  icon: '🔶', model: 'openai/gpt-4o',           providerParam: 'openai-compat', routesTo: 'openai/gpt-4o-mini' },
};

type BaseTab = 'typescript' | 'curl';
type ProviderTab = string; // "py-anthropic", "py-openai", etc.
type AnyTab = BaseTab | ProviderTab;

function buildSnippets(key: string, activeProviders: string[]): Record<AnyTab, { label: string; code: string }> {
  const snippets: Record<AnyTab, { label: string; code: string }> = {};

  for (const p of activeProviders) {
    const cfg = PROVIDER_SNIPPET_CONFIG[p];
    if (!cfg) continue;
    const isOpenRouter = p === 'openrouter';
    const providerArg = p === 'anthropic'
      ? ''
      : isOpenRouter
        ? `\n    extra_body={"provider": "openai-compat", "base_url": "https://openrouter.ai/api/v1"},`
        : `\n    extra_body={"provider": "${cfg.providerParam}"},`;

    if (p === 'anthropic') {
      snippets['py-anthropic-sdk'] = {
        label: '🟤 Claude (anthropic)',
        code: `# pip install anthropic httpx
import anthropic, httpx

client = anthropic.Anthropic(
    api_key="${key}",
    http_client=httpx.Client(base_url="${GATEWAY_BASE}"),
)
msg = client.messages.create(
    model="${cfg.model}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
print(msg.content[0].text)`,
      };
    }

    snippets[`py-${p}`] = {
      label: `${cfg.icon} ${cfg.label} (Python)`,
      code: `# pip install openai==1.57.0
import openai

client = openai.OpenAI(
    base_url="${GATEWAY_URL}",
    api_key="${key}",
)
response = client.chat.completions.create(
    model="${cfg.model}",  # routes to ${cfg.routesTo} for simple tasks
    messages=[{"role": "user", "content": "Hello"}],${providerArg}
)
print(response.choices[0].message.content)

meta = (response.model_extra or {}).get("gateway_meta", {})
print(f"Model used: {meta.get('model_used')}  Saved: \${meta.get('savings_usd', 0):.6f}")`,
    };
  }

  snippets['typescript'] = {
    label: 'TypeScript',
    code: `// npm install openai@^1
import OpenAI from 'openai';

const client = new OpenAI({ baseURL: '${GATEWAY_URL}', apiKey: '${key}' });

// Change provider: extra_body: { provider: 'openai' | 'gemini' | 'groq' | 'anthropic' }
const response = await client.chat.completions.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: 'Hello' }],
});
console.log(response.choices[0].message.content);

const meta = (response as any).gateway_meta ?? {};
console.log('Model used:', meta.model_used, '| Saved: $' + meta.savings_usd);`,
  };

  snippets['curl'] = {
    label: 'cURL',
    code: `# Claude (default)
curl ${GATEWAY_URL}/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"claude-opus-4-7","messages":[{"role":"user","content":"Hello"}]}'

# OpenAI — add "provider":"openai"
curl ${GATEWAY_URL}/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}],"provider":"openai"}'

# OpenRouter — provider=openai-compat + base_url
curl ${GATEWAY_URL}/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-4o","messages":[{"role":"user","content":"Hello"}],"provider":"openai-compat","base_url":"https://openrouter.ai/api/v1"}'

# Gemini  — "provider":"gemini"
# Groq    — "provider":"groq"`,
  };

  return snippets;
}

function QuickStart({ apiKey, hasKeys, activeProviders }: {
  apiKey: string;
  hasKeys: boolean;
  activeProviders: string[];
}) {
  const key = apiKey || '<your-gateway-key>';
  const snippets = buildSnippets(key, activeProviders.length > 0 ? activeProviders : ['anthropic']);
  const tabKeys = Object.keys(snippets) as AnyTab[];
  const [tab, setTab] = useState<AnyTab>(tabKeys[0]);
  const [copied, setCopied] = useState(false);

  // Reset to first tab when provider list changes
  const currentTab = tabKeys.includes(tab) ? tab : tabKeys[0];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[currentTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Quick Start</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {apiKey
              ? 'Your key is pre-filled — copy and run directly'
              : hasKeys
              ? 'Generate a new key above to auto-fill it here (existing keys are not re-shown for security)'
              : 'Generate a Gateway API Key above to auto-fill your key into all examples'}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {tabKeys.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                currentTab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {snippets[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <pre className="px-6 py-5 text-xs font-mono text-gray-700 bg-gray-50 overflow-x-auto leading-relaxed">
          <code>{snippets[currentTab]?.code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-4 flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {!apiKey && (
        <div className="px-6 py-3 border-t border-gray-50 bg-amber-50/50">
          <p className="text-xs text-amber-700">
            {hasKeys
              ? 'Generate a new key above — it will auto-fill here. Replace <your-gateway-key> with your key manually if you already have one.'
              : 'Generate a Gateway API Key above — it will auto-fill into all code examples here.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function GatewayPage() {
  const [days, setDays] = useState(30);
  const [newKey, setNewKey] = useState<string | null>(null);
  const { data: gatewayKeys = [] } = useSWR<any[]>('/api/gateway/keys', fetcher);
  const { data: providerKeys = [] } = useSWR<any[]>('/api/provider-keys', fetcher);
  const activeKey = newKey ?? '';
  // Derive which providers the user has configured; always include anthropic as default
  const activeProviders: string[] = (() => {
    const configured = providerKeys.map((k: any) => k.provider as string);
    // Normalize openai-compat to openrouter if the stored key is for openrouter
    const normalized = configured.map(p =>
      p === 'openai-compat' ? 'openai-compat' : p
    );
    const providers = normalized.length > 0 ? normalized : ['anthropic'];
    // Always show anthropic first
    const ordered = ['anthropic', 'openai', 'gemini', 'groq', 'openrouter', 'openai-compat'];
    return ordered.filter(p => providers.includes(p));
  })();

  const { data: summary, isLoading: loadingSummary } = useSWR(
    `/api/gateway/summary?days=${days}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Initial request history via SWR (no polling — SSE handles live updates)
  const { data: reqData, isLoading: loadingReqs } = useSWR(
    `/api/gateway/requests?limit=50`,
    fetcher,
  );

  const historicRows: any[] = reqData?.data ?? [];
  const initialLastId = historicRows.length > 0 ? (historicRows[0].id ?? 0) : 0;

  // Real-time new rows via SSE
  const { liveRows, flashIds } = useRealtimeRequests(initialLastId);

  // Merge: live rows at the top (deduped against historic)
  const historicIds = new Set(historicRows.map((r: any) => r.id));
  const freshLive = liveRows.filter(r => !historicIds.has(r.id));
  const requests = [...freshLive, ...historicRows];

  const loading = loadingSummary || loadingReqs;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-screen-xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <BackButton fallback="/dashboard" />
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gateway</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI cost optimizer — every request, automatically.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([7, 30, 90] as const).map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                days === d ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >{d}d</button>
          ))}
        </div>
      </motion.div>

      {/* ── Section: Analytics ───────────────────────────────────────────────── */}
      <section className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Analytics</p>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Saved" value={summary ? fmt$(summary.total_savings_usd) : '—'}
              sub={`vs ${summary ? fmt$(summary.total_baseline_usd) : '$0'} baseline`}
              icon={TrendingUp} color="bg-emerald-50 text-emerald-600" delay={0.05} />
            <KpiCard label="Savings Rate" value={summary ? fmtPct(summary.savings_pct) : '—'}
              sub="of baseline cost recovered"
              icon={Zap} color="bg-blue-50 text-blue-600" delay={0.1} />
            <KpiCard label="Cache Hit Rate" value={summary ? fmtPct(summary.cache_hit_rate) : '—'}
              sub="requests served free"
              icon={Key} color="bg-violet-50 text-violet-600" delay={0.15} />
            <KpiCard label="Requests" value={summary ? summary.total_requests.toLocaleString() : '—'}
              sub={`avg ${summary?.avg_ttft_ms ?? '—'}ms TTFT`}
              icon={Activity} color="bg-amber-50 text-amber-600" delay={0.2} />
          </div>
        )}

        {/* Savings Story — hero comparison */}
        <SavingsStory summary={summary} loading={loadingSummary} />

        {/* Cost vs Baseline chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.4 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Cost vs Baseline</h2>
              <p className="text-xs text-gray-400 mt-0.5">Grey = what you would have paid · Green = what you actually paid</p>
            </div>
          </div>
          <CostChart days={days} />
        </motion.div>

        {/* Model Distribution + Optimization Breakdown (equal columns) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900">Model Distribution</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">Which models actually served your requests</p>
            <ModelDonut distribution={summary?.model_distribution ?? {}} />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900">Savings by Optimization</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">Where the savings came from</p>
            <OptBreakdown breakdown={summary?.optimization_breakdown ?? {}} />
          </div>
        </motion.div>
      </section>

      {/* ── Section: Request Log ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Live Requests</p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.4 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Request Log</h2>
              <p className="text-xs text-gray-400 mt-0.5">Grouped by day · click to expand · new requests appear instantly</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Streaming live
            </span>
          </div>
          <DayGroupedLog requests={requests} loading={loading} flashIds={flashIds} />
        </motion.div>
      </section>

      {/* ── Section: Configuration ───────────────────────────────────────────── */}
      <section className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Configuration</p>

        {/* Gateway Keys + Provider Keys side by side on large screens */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <GatewayKeysPanel newKey={newKey} setNewKey={setNewKey} />
          <ProviderKeysPanel />
        </motion.div>

        {/* Quick Start */}
        <QuickStart apiKey={activeKey} hasKeys={gatewayKeys.length > 0} activeProviders={activeProviders} />
      </section>

    </div>
  );
}
