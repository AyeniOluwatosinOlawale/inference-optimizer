'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const BEFORE_LINES = [
  '# Before: direct API call, no optimisation',
  'client = Anthropic(',
  '    api_key="sk-ant-your-key"',
  ')',
  'response = client.messages.create(',
  '    model="claude-opus-4-7",  # 💸 always Opus',
  '    messages=[{"role": "user", "content": msg}]',
  ')',
];

const AFTER_LINES = [
  '# After: one line change, 13 optimisations applied',
  'client = Anthropic(',
  '    base_url="https://gateway.inferenceoptimizer.com",',
  '    api_key="your-gateway-key"',
  ')',
  'response = client.messages.create(',
  '    model="auto",  # ✅ routed to cheapest capable model',
  '    messages=[{"role": "user", "content": msg}]',
  ')',
];

export function Terminal() {
  const [step, setStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = showAfter ? AFTER_LINES : BEFORE_LINES;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < lines.length - 1) {
        setStep(s => s + 1);
      } else if (!showAfter) {
        setTimeout(() => { setShowAfter(true); setStep(0); }, 1200);
      }
    }, 340);
    return () => clearTimeout(timer);
  }, [step, lines.length, showAfter]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(AFTER_LINES.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl shadow-2xl overflow-hidden bg-gray-950 text-white font-mono text-sm relative border border-gray-800">
      {/* Traffic light dots + tab */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex gap-3 text-xs">
          <span className={`px-2 py-0.5 rounded ${!showAfter ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>before.py</span>
          <span className={`px-2 py-0.5 rounded ${showAfter ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-500'}`}>after.py</span>
        </div>
        <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition-colors" aria-label="Copy">
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Code */}
      <div className="p-5 space-y-1.5 min-h-[220px]">
        {lines.map((line, i) => (
          <div
            key={`${showAfter}-${i}`}
            className={`transition-opacity duration-200 leading-relaxed ${i > step ? 'opacity-0' : 'opacity-100'}`}
          >
            {line.startsWith('#') ? (
              <span className="text-gray-500">{line}</span>
            ) : line.includes('base_url') ? (
              <span>
                <span className="text-blue-400">    base_url</span>
                <span className="text-gray-400">=</span>
                <span className="text-green-400">"https://gateway.inferenceoptimizer.com"</span>
                <span className="text-gray-400">,</span>
              </span>
            ) : line.includes('api_key') && !line.includes('sk-ant') ? (
              <span>
                <span className="text-blue-400">    api_key</span>
                <span className="text-gray-400">=</span>
                <span className="text-green-400">"your-gateway-key"</span>
              </span>
            ) : line.includes('"auto"') ? (
              <span>
                <span className="text-gray-300">    model=</span>
                <span className="text-orange-400">"auto"</span>
                <span className="text-gray-500">,  # ✅ routed to cheapest capable model</span>
              </span>
            ) : line.includes('claude-opus') ? (
              <span>
                <span className="text-gray-300">    model=</span>
                <span className="text-red-400">"claude-opus-4-7"</span>
                <span className="text-gray-500">,  # 💸 always Opus</span>
              </span>
            ) : (
              <span className="text-gray-300">{line}</span>
            )}
          </div>
        ))}
        {showAfter && step === lines.length - 1 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex gap-4 text-xs">
              <span className="text-green-400">✓ Routed to Haiku</span>
              <span className="text-green-400">✓ Cache hit</span>
              <span className="text-orange-400">↓ 73% cost</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
