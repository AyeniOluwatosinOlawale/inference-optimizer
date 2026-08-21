'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, TrendingUp, Zap, Activity, Plus, X, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const fmt$ = (v: number | string) => {
  const n = Number(v);
  if (isNaN(n)) return '$0.0000';
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.0001) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

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
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${Number(v).toFixed(4)}`} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: any, name: any) => [fmt$(Number(v)), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line type="monotone" dataKey="Without optimizer" stroke="#d1d5db" strokeDasharray="5 3"
          strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="With optimizer" stroke="#10b981"
          strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.45 }}
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

  const { data: reqData, isLoading: loadingReqs } = useSWR(
    `/api/gateway/requests?limit=50`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const requests: any[] = reqData?.data ?? [];
  const loading = loadingSummary || loadingReqs;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <BackButton fallback="/dashboard" />
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gateway</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI cost optimizer — every request, automatically.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([7, 30, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                days === d ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Saved"
            value={summary ? fmt$(summary.total_savings_usd) : '—'}
            sub={`vs ${summary ? fmt$(summary.total_baseline_usd) : '$0'} baseline`}
            icon={TrendingUp}
            color="bg-emerald-50 text-emerald-600"
            delay={0.05}
          />
          <KpiCard
            label="Savings Rate"
            value={summary ? fmtPct(summary.savings_pct) : '—'}
            sub="of baseline cost recovered"
            icon={Zap}
            color="bg-blue-50 text-blue-600"
            delay={0.1}
          />
          <KpiCard
            label="Cache Hit Rate"
            value={summary ? fmtPct(summary.cache_hit_rate) : '—'}
            sub="requests served free"
            icon={Key}
            color="bg-violet-50 text-violet-600"
            delay={0.15}
          />
          <KpiCard
            label="Requests"
            value={summary ? summary.total_requests.toLocaleString() : '—'}
            sub={`avg ${summary?.avg_ttft_ms ?? '—'}ms TTFT`}
            icon={Activity}
            color="bg-amber-50 text-amber-600"
            delay={0.2}
          />
        </div>
      )}

      {/* Cost Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.45 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
      >
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Cost vs Baseline</h2>
          <p className="text-xs text-gray-400 mt-0.5">The gap between the lines is money you kept</p>
        </div>
        <CostChart days={days} />
      </motion.div>

      {/* Gateway Keys + Provider Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.45 }}
      >
        <GatewayKeysPanel newKey={newKey} setNewKey={setNewKey} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33, duration: 0.45 }}
      >
        <ProviderKeysPanel />
      </motion.div>

      {/* Request Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Request Log</h2>
          <p className="text-xs text-gray-400 mt-0.5">Every request processed by the gateway</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                <th className="px-6 py-3 text-left font-medium">Time</th>
                <th className="px-6 py-3 text-left font-medium">Route</th>
                <th className="px-6 py-3 text-right font-medium">Tokens</th>
                <th className="px-6 py-3 text-right font-medium">Cost</th>
                <th className="px-6 py-3 text-right font-medium">Saved</th>
                <th className="px-6 py-3 text-left font-medium">Optimizations</th>
                <th className="px-6 py-3 text-right font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No requests yet — send traffic through the gateway to see it here.
                  </td>
                </tr>
              ) : (
                requests.map((r: any, i: number) => {
                  const reqModel = MODEL_SHORT[r.modelRequested ?? r.model_requested] ?? (r.modelRequested ?? r.model_requested);
                  const usedModel = MODEL_SHORT[r.modelUsed ?? r.model_used] ?? (r.modelUsed ?? r.model_used);
                  const routed = reqModel !== usedModel;
                  const savings = parseFloat(String(r.savingsUsd ?? r.savings_usd ?? '0'));
                  const cost = parseFloat(String(r.costUsd ?? r.cost_usd ?? '0'));
                  const opts: string[] = (() => {
                    const raw = r.optimizations ?? [];
                    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
                    return raw;
                  })();
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 + i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(r.createdAt ?? r.created_at).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-400">{reqModel}</span>
                          {routed && (
                            <>
                              <span className="text-gray-300">→</span>
                              <span className="font-semibold text-gray-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {usedModel}
                              </span>
                            </>
                          )}
                          {!routed && <span className="font-semibold text-gray-800">{usedModel}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-gray-600">
                        {((r.inputTokens ?? r.input_tokens ?? 0) + (r.outputTokens ?? r.output_tokens ?? 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-medium text-gray-900">
                        {(r.fromCache ?? r.from_cache) ? (
                          <span className="text-emerald-600 font-semibold">Free</span>
                        ) : fmt$(cost)}
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-semibold text-emerald-600">
                        {savings > 0 ? `+${fmt$(savings)}` : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {opts.map((o: string) => <OptPill key={o} label={o} />)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-gray-500">
                        {r.ttftMs ?? r.ttft_ms
                          ? `${r.ttftMs ?? r.ttft_ms}ms`
                          : r.totalMs ?? r.total_ms
                          ? `${r.totalMs ?? r.total_ms}ms`
                          : '—'}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Start — always visible */}
      <QuickStart apiKey={activeKey} hasKeys={gatewayKeys.length > 0} activeProviders={activeProviders} />
    </div>
  );
}
