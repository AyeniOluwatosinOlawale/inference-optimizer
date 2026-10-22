'use client';

import { useState } from 'react';
import { Copy, Check, KeyRound, Terminal, Code2, Loader2, ExternalLink } from 'lucide-react';

const ENDPOINT = 'https://api.136.65.123.94.nip.io/agent/v1';

const SNIPPETS = {
  python: `from openai import OpenAI

client = OpenAI(
    base_url="${ENDPOINT}",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="AnaModel",
    messages=[{"role": "user", "content": "What's the latest AI news?"}],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`,

  javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${ENDPOINT}',
  apiKey: 'YOUR_API_KEY',
});

const stream = await client.chat.completions.create({
  model: 'AnaModel',
  messages: [{ role: 'user', content: "What's the latest AI news?" }],
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
      {"role": "user", "content": "What is happening in tech today?"}
    ]
  }'`,
};

type Tab = 'python' | 'javascript' | 'curl';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
      {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function DeveloperSection() {
  const [tab, setTab] = useState<Tab>('python');
  const [username, setUsername] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  const generateKey = async () => {
    if (!username.trim()) { setError('Enter a username first'); return; }
    setLoading(true); setError(''); setGeneratedKey('');
    try {
      const res = await fetch('/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, budget: 5, rpm: 30 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to generate key'); return; }
      setGeneratedKey(data.key);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'python',     label: 'Python',     icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'javascript', label: 'JavaScript', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'curl',       label: 'cURL',       icon: <Terminal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div id="developer" className="mb-12 scroll-mt-24">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Developer Access</h2>
        <p className="text-sm text-gray-500">
          Drop-in replacement for the OpenAI SDK — live web search, agentic tools, and streaming built in.
        </p>
        <div className="mt-3 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
      </div>

      {/* Endpoint pill */}
      <div className="flex items-center gap-3 bg-[#16213E] rounded-xl px-4 py-3 mb-6">
        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider shrink-0">Endpoint</span>
        <code className="text-sm font-mono text-white flex-1 truncate">{ENDPOINT}</code>
        <CopyButton text={ENDPOINT} />
        <a href={`${ENDPOINT.replace('/agent/v1','')}/chat`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 shrink-0">
          Chat UI <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Code tabs */}
      <div className="rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-teal-600 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-3">
            <CopyButton text={SNIPPETS[tab]} />
          </div>
        </div>
        <pre className="bg-[#1E2D40] text-[#D4E6FF] text-xs font-mono p-5 overflow-x-auto leading-relaxed">
          {SNIPPETS[tab]}
        </pre>
      </div>

      {/* Key generation */}
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

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}

        {generatedKey && (
          <div className="mt-3 flex items-center gap-2 bg-white rounded-lg border border-teal-200 px-3 py-2">
            <code className="flex-1 text-xs font-mono text-gray-800 truncate">{generatedKey}</code>
            <button onClick={copyKey}
              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0">
              {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {keyCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {generatedKey && (
          <p className="mt-2 text-xs text-teal-700">
            Replace <code className="font-mono bg-teal-100 px-1 rounded">YOUR_API_KEY</code> in the code examples above with this key.
          </p>
        )}
      </div>
    </div>
  );
}
