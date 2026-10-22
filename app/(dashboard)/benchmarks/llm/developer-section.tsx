'use client';

import { useState } from 'react';
import { Copy, Check, KeyRound, Terminal, Code2, Loader2, ExternalLink, Zap, Link2 } from 'lucide-react';

const BASE   = 'https://api.136.65.123.94.nip.io';
const ENDPOINT = `${BASE}/agent/v1`;

// ── Code snippets ──────────────────────────────────────────────────────────────

const CHAT_SNIPPETS = {
  python: `from openai import OpenAI

client = OpenAI(
    base_url="${ENDPOINT}",
    api_key="YOUR_API_KEY"
)

# Streams tokens in real-time.
# Web search, weather, and calculator trigger automatically.
stream = client.chat.completions.create(
    model="AnaModel",
    messages=[{"role": "user", "content": "What is the latest AI news?"}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`,

  javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${ENDPOINT}',
  apiKey: 'YOUR_API_KEY',
});

const stream = await client.chat.completions.create({
  model: 'AnaModel',
  messages: [{ role: 'user', content: 'What is the latest AI news?' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}`,

  curl: `curl -X POST ${ENDPOINT}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "AnaModel",
    "stream": true,
    "messages": [
      {"role": "user", "content": "What is the latest AI news?"}
    ]
  }'`,
};

const GOAL_SNIPPETS = {
  python: `import httpx, json

# Give it a goal — it plans, executes each step, and
# streams progress in real-time until the task is done.
with httpx.stream(
    "POST",
    "${ENDPOINT}/agent/goal",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "goal": (
            "Find all open GitHub issues in my repo, "
            "check if any are linked to failed Stripe payments, "
            "then post a summary in the #billing Slack channel"
        ),
        "integrations": {
            "github": {"token": "ghp_YOUR_TOKEN"},
            "stripe": {"api_key": "sk_live_YOUR_KEY"},
            "slack":  {"token": "xoxb-YOUR_TOKEN"},
        },
    },
    timeout=120,
) as r:
    for line in r.iter_lines():
        if line.startswith("data: ") and line != "data: [DONE]":
            chunk = json.loads(line[6:])
            print(chunk["choices"][0]["delta"].get("content", ""), end="")`,

  javascript: `import fetch from 'node-fetch';

const res = await fetch('${ENDPOINT}/agent/goal', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    goal: 'Find open GitHub issues, check failed Stripe payments, post summary to Slack',
    integrations: {
      github: { token: 'ghp_YOUR_TOKEN' },
      stripe: { api_key: 'sk_live_YOUR_KEY' },
      slack:  { token: 'xoxb-YOUR_TOKEN' },
    },
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  for (const line of text.split('\\n')) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const chunk = JSON.parse(line.slice(6));
      process.stdout.write(chunk.choices[0].delta?.content ?? '');
    }
  }
}`,

  curl: `curl -X POST ${ENDPOINT}/agent/goal \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "Find open GitHub issues and post a Slack summary",
    "integrations": {
      "github": {"token": "ghp_YOUR_TOKEN"},
      "slack":  {"token": "xoxb-YOUR_TOKEN"}
    }
  }'`,
};

const INTEGRATION_SNIPPETS = {
  python: `from openai import OpenAI

client = OpenAI(base_url="${ENDPOINT}", api_key="YOUR_API_KEY")

# Pass credentials once in the request — the agent unlocks
# the matching tools automatically for this session only.
# Alternatively, just paste the token in your chat message.
response = client.chat.completions.create(
    model="AnaModel",
    messages=[{
        "role": "user",
        "content": "Show my Stripe balance and last 5 payments"
    }],
    extra_body={
        "integrations": {
            "stripe":   {"api_key": "sk_live_YOUR_KEY"},
            "github":   {"token": "ghp_YOUR_TOKEN"},
            "supabase": {"url": "https://xyz.supabase.co", "anon_key": "eyJ..."},
            "slack":    {"token": "xoxb-YOUR_TOKEN"},
            "notion":   {"token": "secret_YOUR_TOKEN"},
            "linear":   {"api_key": "lin_api_YOUR_KEY"},
            "resend":   {"api_key": "re_YOUR_KEY"},
            "twilio":   {"account_sid": "ACxxx", "auth_token": "xxx", "from_number": "+1555..."},
        },
        # Set to true to allow refunds, sends, and data mutations.
        # By default, critical actions are blocked until you confirm.
        "allow_destructive": False,
    },
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`,

  javascript: `import OpenAI from 'openai';

const client = new OpenAI({ baseURL: '${ENDPOINT}', apiKey: 'YOUR_API_KEY' });

const stream = await client.chat.completions.create({
  model: 'AnaModel',
  messages: [{ role: 'user', content: 'Show my Stripe balance and last 5 payments' }],
  // @ts-ignore — extra_body passes through to the server
  integrations: {
    stripe:   { api_key: 'sk_live_YOUR_KEY' },
    github:   { token: 'ghp_YOUR_TOKEN' },
    supabase: { url: 'https://xyz.supabase.co', anon_key: 'eyJ...' },
    slack:    { token: 'xoxb-YOUR_TOKEN' },
    notion:   { token: 'secret_YOUR_TOKEN' },
    linear:   { api_key: 'lin_api_YOUR_KEY' },
    resend:   { api_key: 're_YOUR_KEY' },
    twilio:   { account_sid: 'ACxxx', auth_token: 'xxx', from_number: '+1555...' },
  },
  allow_destructive: false,
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}`,

  curl: `# Option A — pass in request body
curl -X POST ${ENDPOINT}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "AnaModel",
    "stream": true,
    "allow_destructive": false,
    "integrations": {
      "stripe":   {"api_key": "sk_live_YOUR_KEY"},
      "github":   {"token": "ghp_YOUR_TOKEN"},
      "supabase": {"url": "https://xyz.supabase.co", "anon_key": "eyJ..."},
      "slack":    {"token": "xoxb-YOUR_TOKEN"}
    },
    "messages": [
      {"role": "user", "content": "Show my Stripe balance"}
    ]
  }'

# Option B — just paste the token in your message (no extra config needed)
curl -X POST ${ENDPOINT}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "AnaModel",
    "stream": true,
    "messages": [
      {"role": "user", "content": "My Stripe key is sk_live_xxx — show my balance"}
    ]
  }'`,
};

// ── Shared UI ──────────────────────────────────────────────────────────────────

type Tab = 'python' | 'javascript' | 'curl';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
      {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ snippets, defaultTab = 'python' }: { snippets: Record<Tab, string>; defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'python',     label: 'Python'     },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'curl',       label: 'cURL'       },
  ];
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-teal-600 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center pr-3">
          <CopyButton text={snippets[tab]} />
        </div>
      </div>
      <pre className="bg-[#1E2D40] text-[#D4E6FF] text-xs font-mono p-5 overflow-x-auto leading-relaxed whitespace-pre">
        {snippets[tab]}
      </pre>
    </div>
  );
}

function SectionHeader({ icon, title, badge, desc }: {
  icon: React.ReactNode; title: string; badge?: string; desc: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 ml-9">{desc}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DeveloperSection() {
  const [username, setUsername]     = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [keyCopied, setKeyCopied]   = useState(false);

  const generateKey = async () => {
    if (!username.trim()) { setError('Enter a username first'); return; }
    setLoading(true); setError(''); setGeneratedKey('');
    try {
      const res  = await fetch('/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, budget: 5, rpm: 30 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to generate key'); return; }
      setGeneratedKey(data.key);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  return (
    <div id="developer" className="mb-12 scroll-mt-24">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Developer Access</h2>
        <p className="text-sm text-gray-500">
          OpenAI-compatible API — three modes, one endpoint. Swap your base URL and every existing integration just works.
        </p>
        <div className="mt-3 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
      </div>

      {/* Endpoint pill */}
      <div className="flex items-center gap-3 bg-[#16213E] rounded-xl px-4 py-3 mb-8">
        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider shrink-0">Endpoint</span>
        <code className="text-sm font-mono text-white flex-1 truncate">{ENDPOINT}</code>
        <CopyButton text={ENDPOINT} />
        <a href={`${BASE}/chat`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 shrink-0">
          Chat UI <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Endpoints reference */}
      <div className="rounded-xl border border-gray-200 p-4 mb-8">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">All Endpoints</p>
        <div className="space-y-2">
          {[
            { method: 'POST', path: '/v1/chat/completions', desc: 'Chat, streaming, agentic tool chains — drop-in OpenAI replacement' },
            { method: 'POST', path: '/v1/agent/goal',       desc: 'Autonomous goal execution — plan + execute + stream progress' },
            { method: 'GET',  path: '/v1/models',           desc: 'List available models (AnaModel, llama3, qwen3, …)' },
          ].map(e => (
            <div key={e.path} className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <span className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${e.method === 'POST' ? 'text-teal-600' : 'text-blue-500'}`}>
                {e.method}
              </span>
              <code className="text-xs font-mono text-gray-800 shrink-0">{e.path}</code>
              <span className="text-xs text-gray-500">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1 — Chat */}
      <div className="mb-8">
        <SectionHeader
          icon={<Code2 className="w-4 h-4" />}
          title="Chat & Agentic Tools"
          badge="Mode 1 + 2"
          desc="Standard chat with automatic tool use. The agent decides when to search the web, run code, or check the weather — you just ask."
        />
        <CodeBlock snippets={CHAT_SNIPPETS} />
      </div>

      {/* Section 2 — Goal execution */}
      <div className="mb-8">
        <SectionHeader
          icon={<Zap className="w-4 h-4" />}
          title="Goal-Oriented Execution"
          badge="Mode 3"
          desc="Give it a goal, not a message. The agent plans the steps, executes each one using tools, and streams live progress. Ideal for automation and multi-service workflows."
        />

        {/* How it works pills */}
        <div className="flex flex-wrap gap-2 mb-4 ml-9">
          {['1. Receives goal', '2. Writes a plan', '3. Executes step by step', '4. Streams progress live', '5. Summarises results'].map(s => (
            <span key={s} className="text-[11px] bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2.5 py-1 font-medium">
              {s}
            </span>
          ))}
        </div>

        <CodeBlock snippets={GOAL_SNIPPETS} />
      </div>

      {/* Section 3 — Integrations */}
      <div className="mb-8">
        <SectionHeader
          icon={<Link2 className="w-4 h-4" />}
          title="Integrations"
          desc="Connect external services by passing credentials in the request body — or just paste the token directly in your chat message. The agent detects it automatically."
        />

        {/* Integration chips */}
        <div className="flex flex-wrap gap-2 mb-4 ml-9">
          {[
            { label: 'GitHub',   color: 'bg-gray-100 text-gray-700' },
            { label: 'Stripe',   color: 'bg-purple-50 text-purple-700' },
            { label: 'Supabase', color: 'bg-green-50 text-green-700' },
            { label: 'Slack',    color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Notion',   color: 'bg-gray-100 text-gray-700' },
            { label: 'Linear',   color: 'bg-blue-50 text-blue-700' },
            { label: 'Resend',   color: 'bg-orange-50 text-orange-700' },
            { label: 'Twilio',   color: 'bg-red-50 text-red-700' },
          ].map(i => (
            <span key={i.label} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${i.color}`}>
              {i.label}
            </span>
          ))}
        </div>

        {/* allow_destructive callout */}
        <div className="ml-9 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
          <p className="text-xs font-bold text-amber-800 mb-0.5">Critical actions require confirmation</p>
          <p className="text-xs text-amber-700">
            By default, actions that send money, messages, or mutate data (Stripe refunds, Slack sends, Supabase updates) are
            blocked until you reply <code className="font-mono bg-amber-100 px-1 rounded">yes</code> or set{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">allow_destructive: true</code> in the request.
          </p>
        </div>

        <CodeBlock snippets={INTEGRATION_SNIPPETS} />
      </div>

      {/* Generate API Key */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-bold text-teal-800">Generate API Key</p>
          <span className="text-xs text-teal-600 ml-auto">$5 budget · 30 req/min · 30 days</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter username (e.g. alice)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateKey()}
            className="flex-1 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button onClick={generateKey} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        {generatedKey && (
          <>
            <div className="mt-3 flex items-center gap-2 bg-white rounded-lg border border-teal-200 px-3 py-2">
              <code className="flex-1 text-xs font-mono text-gray-800 truncate">{generatedKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedKey); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000); }}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0">
                {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {keyCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-teal-700">
              Replace <code className="font-mono bg-teal-100 px-1 rounded">YOUR_API_KEY</code> in the examples above with this key.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
