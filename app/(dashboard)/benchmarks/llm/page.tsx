import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Cpu, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import {
  META, HEADLINE, SLA,
  UC1_PARETO, UC2_PERCENTILES, UC3_HH, UC4_GOODPUT,
  UC5_LONGCTX, UC6_TP2, UC7_SLICES,
} from './data';

// ─── Shared components ────────────────────────────────────────────────────────

function SectionAnchor({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div id={id} className="mb-6 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
      <div className="mt-3 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
    </div>
  );
}

function MetricBadge({ val, pass }: { val: number; pass: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
      pass ? 'text-emerald-600' : 'text-red-600'
    }`}>
      {pass
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle className="w-3 h-3" />}
      {val.toFixed(1)} ms
    </span>
  );
}

function EngineTag({ engine }: { engine: string }) {
  const isSg = engine.toLowerCase().includes('sglang') || engine === 'SGLang';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
      isSg ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
    }`}>
      {isSg ? 'SGLang' : 'vLLM'}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-white uppercase tracking-wider bg-[#16213E] whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono, right, muted }: {
  children: React.ReactNode; mono?: boolean; right?: boolean; muted?: boolean
}) {
  return (
    <td className={`px-3 py-2 text-xs border-b border-gray-100 ${
      mono  ? 'font-mono' : ''
    } ${right ? 'text-right' : 'text-left'
    } ${muted ? 'text-gray-400' : 'text-gray-800'}`}>
      {children}
    </td>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 text-sm mb-6">
      <table className="w-full min-w-[540px]">{children}</table>
    </div>
  );
}

function ChartImg({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="flex flex-col items-center">
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <Image src={src} alt={alt} width={800} height={480}
          className="w-full h-auto object-contain" />
      </div>
      <figcaption className="mt-2 text-xs text-gray-500 italic text-center">{caption}</figcaption>
    </figure>
  );
}

function TwoUp({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">{children}</div>;
}

function Callout({ children, variant = 'info' }: {
  children: React.ReactNode; variant?: 'info' | 'success' | 'warning'
}) {
  const cls = {
    info:    'bg-blue-50  border-blue-300  text-blue-900',
    success: 'bg-emerald-50 border-emerald-400 text-emerald-900',
    warning: 'bg-amber-50 border-amber-400 text-amber-900',
  }[variant];
  return (
    <div className={`border-l-4 rounded-r-xl px-4 py-3 text-sm mb-6 ${cls}`}>
      {children}
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 mb-8">
      <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Key Takeaways</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-teal-900">
            <span className="mt-0.5 text-teal-500 shrink-0">→</span>
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-[#1E2D40] text-[#D4E6FF] text-xs font-mono p-4 overflow-x-auto mb-6 leading-relaxed">
      {children}
    </pre>
  );
}

// ─── Sidebar TOC ─────────────────────────────────────────────────────────────
const TOC = [
  { id: 'setup',  label: 'Setup' },
  { id: 'uc1',    label: 'UC 1: Profiling & Pareto' },
  { id: 'uc2',    label: 'UC 2: Percentile Analysis' },
  { id: 'uc3',    label: 'UC 3: Engine Comparison' },
  { id: 'uc4',    label: 'UC 4: Goodput / SLA' },
  { id: 'uc5',    label: 'UC 5: Long-Context' },
  { id: 'uc6',    label: 'UC 6: Tensor Parallel TP=2' },
  { id: 'uc7',    label: 'UC 7: Saturation Analysis' },
  { id: 'bottleneck', label: 'Bottleneck Classification' },
  { id: 'summary', label: 'Summary' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export const metadata = {
  title: 'LLM Inference Benchmark — SGLang vs vLLM on Qwen3-8B / 2×H100',
};

export default function LLMBenchmarkPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#16213E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Cpu className="w-4 h-4" />
            Inference Optimizer Lab · Comprehensive LLM Benchmark
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
            SGLang v0.5.20 vs vLLM v0.30.0
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-6 max-w-2xl">
            Throughput &amp; latency benchmarking on <span className="text-teal-300 font-semibold">Qwen3-8B</span> across
            single-GPU sweeps, head-to-head comparison, long-context RadixAttention,
            and NVLink TP=2 multi-GPU scaling.
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-8">
            {[
              ['Model', META.model],
              ['Hardware', META.hardware],
              ['Date', META.date],
            ].map(([k, v]) => (
              <span key={k}><span className="text-slate-500 mr-1">{k}:</span>{v}</span>
            ))}
            <a href={META.source} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors">
              <Github className="w-3.5 h-3.5" />Source
            </a>
          </div>

          {/* Headline stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {HEADLINE.map(h => (
              <div key={h.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 leading-none mb-0.5">{h.value}</div>
                <div className="text-[10px] text-teal-300 font-semibold mb-1">{h.unit}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{h.label}</div>
                <div className="text-[9px] text-slate-500 mt-1">{h.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA banner */}
      <div className="bg-slate-800 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4 items-center">
          <span className="text-slate-400 font-semibold">SLA thresholds:</span>
          <span>TTFT ≤ <span className="text-teal-400 font-mono font-bold">{SLA.ttft_ms} ms</span></span>
          <span>E2E ≤ <span className="text-teal-400 font-mono font-bold">{SLA.e2e_ms.toLocaleString()} ms</span></span>
          <span>TPOT ≤ <span className="text-teal-400 font-mono font-bold">{SLA.tpot_ms} ms</span></span>
          <span className="text-slate-500 ml-auto hidden sm:block">
            Goodput = % of all requests meeting every threshold simultaneously
          </span>
        </div>
      </div>

      {/* ── Body: sidebar + content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">

        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">On this page</p>
            <nav className="flex flex-col gap-0.5">
              {TOC.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50 px-2 py-1.5 rounded transition-colors truncate">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 mb-2">Download</p>
              <a href="/InferenceOptimizer_BenchmarkReport.pdf" download
                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                <ExternalLink className="w-3 h-3" />Full PDF Report
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 max-w-4xl">

          {/* ── Setup ──────────────────────────────────────────────────── */}
          <SectionAnchor id="setup" title="Setup: Test Endpoint Details" />

          <Table>
            <thead><tr>
              <Th>Component</Th><Th>Specification</Th>
            </tr></thead>
            <tbody>
              {[
                ['GPUs', '2 × NVIDIA H100 NVL 94 GB HBM3'],
                ['Interconnect', 'NVLink 4.0 (bridge topology · 900 GB/s bidirectional)'],
                ['CUDA', '13.4'],
                ['SGLang', 'v0.5.20 — latest stable (Sep 18 2026) · RadixAttention · FP8 KV'],
                ['vLLM', 'v0.30.0 — latest stable (Sep 22 2026) · PagedKV · ContinuousBatching'],
                ['Model', 'Qwen/Qwen3-8B — 8B params · 128K native context · BF16 weights'],
                ['Cells / sweep', '112 default · 28 peak · 12 quick · 20 requests/cell'],
              ].map(([k, v]) => (
                <tr key={k} className="even:bg-gray-50">
                  <Td><span className="font-semibold text-gray-700">{k}</span></Td>
                  <Td muted={false}>{v}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* ── UC1 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc1"
            title="Use Case 1: Simple Profiling — SGLang Baseline with Pareto Analysis"
            sub="Phase A · SGLang single GPU · 112-cell default sweep" />

          <Code>{`# Phase A3 — SGLang full default sweep
python -m inference_optimizer sweep \\
    --engine sglang --model Qwen/Qwen3-8B \\
    --sglang-url http://localhost:30000 \\
    --output-dir ./results/sglang_default`}</Code>

          <h3 className="text-sm font-bold text-gray-700 mb-2">Pareto Curve — ctx=1024, random</h3>
          <p className="text-sm text-gray-500 mb-3">
            Sweeping concurrency from 1 to 64 reveals the throughput–latency trade-off.
            Higher concurrency increases TPS by batching, but raises queuing delay and TPOT.
          </p>
          <Table>
            <thead><tr>
              <Th>Concurrency</Th><Th>TPS</Th><Th>TTFT p50</Th><Th>TPOT p50</Th><Th>TPOT p99</Th><Th>Trade-off</Th>
            </tr></thead>
            <tbody>
              {UC1_PARETO.map(r => {
                const slaOk = r.tpot_p99 <= SLA.tpot_ms;
                return (
                  <tr key={r.c} className={`even:bg-gray-50 ${!slaOk ? 'bg-red-50!' : ''}`}>
                    <Td mono><span className="font-bold">{r.c}</span></Td>
                    <Td mono right>{r.tps.toLocaleString()}</Td>
                    <Td mono right>{r.ttft_p50} ms</Td>
                    <Td mono right>{r.tpot_p50} ms</Td>
                    <Td mono right>
                      <MetricBadge val={r.tpot_p99} pass={slaOk} />
                    </Td>
                    <Td>
                      <span className={`text-xs ${
                        r.tier.includes('risk') || r.tier.includes('Sat')
                          ? 'text-red-600 font-semibold'
                          : r.tier === 'Balanced'
                            ? 'text-emerald-700 font-medium'
                            : 'text-gray-600'
                      }`}>{r.tier}</span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <TwoUp>
            <ChartImg src="/benchmarks/sglang_throughput_random.png"
              alt="SGLang throughput — random" caption="Figure 1.1: SGLang throughput curve — random" />
            <ChartImg src="/benchmarks/sglang_latency_random.png"
              alt="SGLang latency — random" caption="Figure 1.2: SGLang latency curve — random" />
          </TwoUp>
          <TwoUp>
            <ChartImg src="/benchmarks/sglang_heatmap_ttft.png"
              alt="SGLang TTFT heatmap" caption="Figure 1.3: TTFT p50 heatmap (ctx × concurrency)" />
            <ChartImg src="/benchmarks/sglang_heatmap_tpot.png"
              alt="SGLang TPOT heatmap" caption="Figure 1.4: TPOT p50 heatmap (ctx × concurrency)" />
          </TwoUp>

          <KeyTakeaways items={[
            'SGLang achieves peak <strong>2,148 tok/s</strong> at ctx=1024 c=1 — decode-bandwidth bound.',
            'Optimal operating point is <strong>c=4–8</strong>: 80% of peak TPS at 2× lower TTFT.',
            'Saturation cliff at <strong>c=32</strong>: TPOT p99 crosses the 50 ms SLA limit.',
            'Shared-prefix TTFT is 8–12× lower than random at the same context length.',
          ]} />

          {/* ── UC2 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc2"
            title="Use Case 2: Custom Percentile Analysis — p90 / p99 Latency Tails"
            sub="Why p50 metrics are insufficient for production SLA design" />

          <p className="text-sm text-gray-600 mb-4">
            Median (p50) metrics can look healthy while 1–10% of users experience unacceptable delays.
            Each result folder contains a timestamped <code className="bg-gray-100 px-1 rounded text-xs">*.json</code> with
            per-request records enabling arbitrary percentile analysis.
          </p>

          <Code>{`# Generate p50/p95/p99 + goodput for all result folders:
python3 scripts/generate_report_metrics.py \\
    --results-dir ./results \\
    --output report_metrics.json`}</Code>

          <h3 className="text-sm font-bold text-gray-700 mb-2">Percentile breakdown — ctx=2048, c=8, random</h3>
          <Table>
            <thead><tr>
              <Th>Percentile</Th>
              <Th>SGLang TTFT</Th><Th>vLLM TTFT</Th>
              <Th>SGLang TPOT</Th><Th>vLLM TPOT</Th>
            </tr></thead>
            <tbody>
              {UC2_PERCENTILES.map(r => (
                <tr key={r.p} className="even:bg-gray-50">
                  <Td><span className="font-bold font-mono text-gray-700">{r.p}</span></Td>
                  <Td mono right>{r.sglang_ttft} ms</Td>
                  <Td mono right>{r.vllm_ttft} ms</Td>
                  <Td mono right>{r.sglang_tpot} ms</Td>
                  <Td mono right>{r.vllm_tpot} ms</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <KeyTakeaways items={[
            'p99 TTFT is the SLA gate — p50 can look healthy while p99 breaches the threshold.',
            'SGLang p99 TTFT is ~15% lower than vLLM at ctx=2048 c=8 — better tail behaviour under load.',
            'TPOT tails are nearly identical between engines at the same concurrency — both are HBM-bandwidth limited.',
            'Raw JSONL output enables arbitrary custom percentile analysis beyond the standard set.',
          ]} />

          {/* ── UC3 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc3"
            title="Use Case 3: Head-to-Head Engine Comparison"
            sub="Phase C · SGLang GPU 0 + vLLM GPU 1 · 112 cells × 2 engines simultaneously" />

          <Code>{`# Phase C2 — full head-to-head sweep
python -m inference_optimizer sweep \\
    --engine sglang vllm --model Qwen/Qwen3-8B \\
    --sglang-url http://localhost:30000 \\
    --vllm-url   http://localhost:8000  \\
    --output-dir ./results/headtohead_full`}</Code>

          <TwoUp>
            <ChartImg src="/benchmarks/engine_comparison_all_random.png"
              alt="Engine comparison random" caption="Figure 3.1: Engine comparison — random workload" />
            <ChartImg src="/benchmarks/engine_comparison_all_shared_prefix.png"
              alt="Engine comparison shared prefix" caption="Figure 3.2: Engine comparison — shared_prefix workload" />
          </TwoUp>
          <TwoUp>
            <ChartImg src="/benchmarks/heatmap_ttft_p50_ms_sglang_random.png"
              alt="SGLang TTFT heatmap" caption="Figure 3.3: SGLang TTFT p50 heatmap" />
            <ChartImg src="/benchmarks/heatmap_ttft_p50_ms_vllm_random.png"
              alt="vLLM TTFT heatmap" caption="Figure 3.4: vLLM TTFT p50 heatmap" />
          </TwoUp>

          <h3 className="text-sm font-bold text-gray-700 mb-2">Head-to-Head Results — key cells, random workload</h3>
          <Table>
            <thead><tr>
              <Th>Engine</Th><Th>Ctx</Th><Th>C</Th>
              <Th>TPS</Th><Th>TTFT p50</Th><Th>TTFT p99</Th>
              <Th>TPOT p50</Th><Th>TPOT p99</Th>
            </tr></thead>
            <tbody>
              {UC3_HH.map((r, i) => {
                const ttftBreach = r.ttft_p50 > SLA.ttft_ms;
                const tpotBreach = r.tpot_p99 > SLA.tpot_ms;
                return (
                  <tr key={i} className="even:bg-gray-50">
                    <Td><EngineTag engine={r.engine} /></Td>
                    <Td mono right>{r.ctx.toLocaleString()}</Td>
                    <Td mono right>{r.c}</Td>
                    <Td mono right><span className="font-bold">{r.tps.toLocaleString()}</span></Td>
                    <Td mono right>
                      {ttftBreach
                        ? <span className="text-red-600 font-bold">{r.ttft_p50} ms ⚠</span>
                        : `${r.ttft_p50} ms`}
                    </Td>
                    <Td mono right>{r.ttft_p99} ms</Td>
                    <Td mono right>{r.tpot_p50} ms</Td>
                    <Td mono right>
                      {tpotBreach
                        ? <span className="text-red-600 font-bold">{r.tpot_p99} ms ⚠</span>
                        : `${r.tpot_p99} ms`}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <KeyTakeaways items={[
            'SGLang leads by ~4% peak TPS (2,148 vs 2,058 tok/s) at ctx=1024 random.',
            'vLLM achieves 7% lower median TTFT at ctx=1024 c=1 (43 ms vs 46 ms) — eager prefill scheduling.',
            'SGLang RadixAttention reduces shared-prefix TTFT by 6–8× vs random at ctx=8192.',
            'vLLM TTFT p50 = <strong>521 ms</strong> at ctx=8192 c=1 — breaches the 500 ms SLA threshold.',
            'TPOT tails are near-identical at same concurrency — both engines are HBM-bandwidth bound.',
          ]} />

          {/* ── UC4 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc4"
            title="Use Case 4: Goodput Analysis — SLA Compliance"
            sub="% of all requests meeting every SLA threshold simultaneously" />

          <Callout variant="info">
            <strong>Goodput</strong> = requests meeting TTFT ≤ {SLA.ttft_ms} ms <em>AND</em> E2E ≤ {SLA.e2e_ms.toLocaleString()} ms <em>AND</em> TPOT ≤ {SLA.tpot_ms} ms,
            as a fraction of <em>all submitted</em> requests (including errors and timeouts).
          </Callout>

          <h3 className="text-sm font-bold text-gray-700 mb-2">SLO Tier Guidance</h3>
          <Table>
            <thead><tr><Th>Tier</Th><Th>TTFT SLO</Th><Th>TPOT SLO</Th><Th>Use Case</Th></tr></thead>
            <tbody>
              {[
                ['Premium',  '≤ 200 ms', '≤ 20 ms',  'Real-time chat · voice · copilot'],
                ['Standard', '≤ 500 ms', '≤ 50 ms',  'Document Q&A · search · RAG'],
                ['Batch',    '≤ 5,000 ms','≤ 200 ms', 'Summarisation · offline labelling'],
              ].map(([tier, ttft, tpot, uc]) => (
                <tr key={tier} className="even:bg-gray-50">
                  <Td><span className="font-bold">{tier}</span></Td>
                  <Td mono>{ttft}</Td><Td mono>{tpot}</Td><Td muted={false}>{uc}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="text-xs text-gray-500 mb-4 -mt-2">This benchmark uses the <strong>Standard</strong> tier thresholds.</p>

          <h3 className="text-sm font-bold text-gray-700 mb-2">Goodput Table — key cells</h3>
          <Table>
            <thead><tr>
              <Th>Engine</Th><Th>Ctx</Th><Th>C</Th><Th>Workload</Th>
              <Th>Success%</Th><Th>Goodput%</Th>
              <Th>TTFT p50</Th><Th>TTFT p99</Th><Th>TPOT p99</Th>
            </tr></thead>
            <tbody>
              {UC4_GOODPUT.map((r, i) => {
                const ttftFail = r.ttft_p50 > SLA.ttft_ms;
                const tpotFail = r.tpot_p99 > SLA.tpot_ms;
                const gputLow  = r.goodput < 90;
                return (
                  <tr key={i} className="even:bg-gray-50">
                    <Td><EngineTag engine={r.engine} /></Td>
                    <Td mono right>{r.ctx.toLocaleString()}</Td>
                    <Td mono right>{r.c}</Td>
                    <Td>
                      <span className="text-xs text-gray-600">{r.wl}</span>
                    </Td>
                    <Td mono right>{r.ok}%</Td>
                    <Td mono right>
                      <span className={`font-bold ${gputLow ? 'text-red-600' : 'text-emerald-600'}`}>
                        {r.goodput}%
                      </span>
                    </Td>
                    <Td mono right>
                      {ttftFail
                        ? <span className="text-red-600 font-bold">{r.ttft_p50} ms ⚠</span>
                        : `${r.ttft_p50} ms`}
                    </Td>
                    <Td mono right>{r.ttft_p99} ms</Td>
                    <Td mono right>
                      {tpotFail
                        ? <span className="text-red-600 font-bold">{r.tpot_p99} ms ⚠</span>
                        : `${r.tpot_p99} ms`}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <KeyTakeaways items={[
            'vLLM goodput drops to <strong>10%</strong> at ctx=8192 c=1 random — TTFT p50 = 521 ms breaches the 500 ms SLA.',
            'SGLang handles the same cell at 100% goodput — TTFT p50 = 462 ms.',
            'Both engines maintain 100% goodput at ctx ≤ 4096 with c ≤ 8.',
            'TPOT p99 is the binding constraint at c=32+ — plan capacity for c ≤ 16 to stay within SLO.',
          ]} />

          {/* ── UC5 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc5"
            title="Use Case 5: Long-Context Benchmarking with RadixAttention"
            sub="Phase D · 64K / 128K tokens · FP8 KV cache · SGLang" />

          <Code>{`# Start SGLang with 128K context + FP8 KV cache
SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1 \\
CUDA_VISIBLE_DEVICES=0 python -m sglang.launch_server \\
    --model-path Qwen/Qwen3-8B \\
    --context-length 131072 \\
    --kv-cache-dtype fp8_e5m2 --port 30000`}</Code>

          <Callout variant="success">
            <strong>RadixAttention delivers a 1,443× TTFT reduction at 131K tokens</strong> — 39 ms cached vs 55,565 ms cold.
            This unlocks sub-100 ms first-token latency at maximum context, critical for production RAG systems.
          </Callout>

          <Table>
            <thead><tr>
              <Th>Context</Th><Th>Workload</Th><Th>TTFT p50</Th><Th>TPOT p50</Th><Th>TPS</Th><Th>Cache</Th>
            </tr></thead>
            <tbody>
              {UC5_LONGCTX.map((r, i) => {
                const hit = r.cache === 'Hit';
                return (
                  <tr key={i} className="even:bg-gray-50">
                    <Td mono>{r.ctx.toLocaleString()} tok</Td>
                    <Td>{r.wl}</Td>
                    <Td mono right>
                      {hit
                        ? <span className="text-emerald-600 font-bold">{r.ttft_p50} ms</span>
                        : <span className="text-red-600">{r.ttft_p50.toLocaleString()} ms</span>}
                    </Td>
                    <Td mono right>{r.tpot_p50} ms</Td>
                    <Td mono right>{r.tps.toLocaleString()}</Td>
                    <Td>
                      {hit
                        ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />RadixAttn hit
                          </span>
                        : <span className="text-xs text-gray-400">Cold — full prefill</span>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <TwoUp>
            <ChartImg src="/benchmarks/longctx_throughput_random.png"
              alt="Long-ctx throughput random" caption="Figure 5.1: Long-ctx throughput — random (cold)" />
            <ChartImg src="/benchmarks/longctx_throughput_shared.png"
              alt="Long-ctx throughput shared" caption="Figure 5.2: Long-ctx throughput — shared_prefix (cached)" />
          </TwoUp>

          <KeyTakeaways items={[
            '<strong>1,443× TTFT reduction</strong> at 131K tokens on shared-prefix vs random workloads.',
            'FP8 KV is essential — BF16 KV at 128K tokens would require 57 GB+, exceeding single-GPU capacity.',
            'Shared-prefix throughput at 64K (1,007 tok/s) matches short-context performance — cache pays prefill once.',
            'For RAG: use SGLang with RadixAttention; even partial prefix sharing yields large TTFT reductions.',
          ]} />

          {/* ── UC6 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc6"
            title="Use Case 6: Tensor Parallelism TP=2 — NVLink Multi-GPU Scaling"
            sub="Phase F · Both H100s · NVLink 4.0 · CUDA_VISIBLE_DEVICES=0,1" />

          <Code>{`# SGLang TP=2
CUDA_VISIBLE_DEVICES=0,1 python -m sglang.launch_server \\
    --model-path Qwen/Qwen3-8B --tp-size 2 --port 30000

# vLLM TP=2
CUDA_VISIBLE_DEVICES=0,1 vllm serve Qwen/Qwen3-8B \\
    --tensor-parallel-size 2 --port 8000`}</Code>

          <Table>
            <thead><tr>
              <Th>Engine</Th><Th>Config</Th><Th>Peak TPS</Th><Th>vs TP=1</Th>
              <Th>TTFT p50</Th><Th>TPOT p50</Th>
            </tr></thead>
            <tbody>
              {UC6_TP2.map((r, i) => {
                const isTP2 = r.vs_tp1 !== null;
                return (
                  <tr key={i} className={`even:bg-gray-50 ${isTP2 ? 'bg-emerald-50/40' : ''}`}>
                    <Td><EngineTag engine={r.engine} /></Td>
                    <Td>{r.config}</Td>
                    <Td mono right>
                      <span className={isTP2 ? 'font-extrabold text-emerald-700' : 'font-bold text-gray-700'}>
                        {r.peak_tps.toLocaleString()}
                      </span>
                    </Td>
                    <Td mono right>
                      {r.vs_tp1
                        ? <span className="text-emerald-600 font-extrabold">{r.vs_tp1}</span>
                        : <span className="text-gray-400">baseline</span>}
                    </Td>
                    <Td mono right>{r.ttft_p50} ms</Td>
                    <Td mono right>{r.tpot_p50} ms</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <TwoUp>
            <ChartImg src="/benchmarks/tp2_sglang_throughput.png"
              alt="SGLang TP=2 throughput" caption="Figure 6.1: SGLang TP=2 throughput — random" />
            <ChartImg src="/benchmarks/tp2_vllm_throughput.png"
              alt="vLLM TP=2 throughput" caption="Figure 6.2: vLLM TP=2 throughput — random" />
          </TwoUp>

          <KeyTakeaways items={[
            'TP=2 delivers <strong>2.63× (SGLang)</strong> and <strong>2.90× (vLLM)</strong> throughput — well above the 1.95× linear estimate.',
            'Always use TP=2 on 2×H100 NVL — essentially free (no added GPU-hour cost per request).',
            'TTFT p50 drops 33–35% under TP=2 due to parallelised prefill compute.',
            'NVSwitch is not required — NVLink bridge alone achieves near-ideal scaling for 8B models.',
          ]} />

          {/* ── UC7 ────────────────────────────────────────────────────── */}
          <SectionAnchor id="uc7"
            title="Use Case 7: Time-Sliced Saturation Analysis"
            sub="Tracing the performance trajectory from c=1 to c=64 — SGLang, ctx=1024, random" />

          <Table>
            <thead><tr>
              <Th>Slice</Th><Th>Concurrency</Th><Th>TPS</Th>
              <Th>TTFT p50</Th><Th>TPOT p50</Th><Th>TPOT p99</Th><Th>SLA</Th>
            </tr></thead>
            <tbody>
              {UC7_SLICES.map(r => (
                <tr key={r.slice} className={`even:bg-gray-50 ${!r.sla ? 'bg-red-50' : ''}`}>
                  <Td mono muted>{r.slice}</Td>
                  <Td mono right><span className="font-bold">{r.c}</span></Td>
                  <Td mono right>{r.tps.toLocaleString()}</Td>
                  <Td mono right>{r.ttft_p50} ms</Td>
                  <Td mono right>{r.tpot_p50} ms</Td>
                  <Td mono right>
                    <MetricBadge val={r.tpot_p99} pass={r.sla} />
                  </Td>
                  <Td>
                    {r.sla
                      ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />Pass</span>
                      : <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><AlertTriangle className="w-3 h-3" />Breach</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <KeyTakeaways items={[
            'TPS scales near-linearly from c=1 to c=16, then plateaus — the knee of the concurrency curve.',
            'Saturation cliff at <strong>c=32</strong>: TPOT p99 crosses 50 ms for both engines at all context lengths.',
            'Scale horizontally (more replicas) rather than vertically (higher c) beyond c=16.',
            'Monitor TPOT p99 in production — set alerts at 45 ms (90% of SLA) to catch saturation before users notice.',
          ]} />

          {/* ── Bottleneck ─────────────────────────────────────────────── */}
          <SectionAnchor id="bottleneck" title="Bottleneck Classification"
            sub="Automatic per-cell classification using GPU util, TTFT/TPOT trends, and queue depth" />

          <Table>
            <thead><tr><Th>Class</Th><Th>Meaning</Th><Th>Typical trigger</Th></tr></thead>
            <tbody>
              {[
                ['prefill_compute',   'GPU saturated during prompt encoding',  'ctx > 8K, c=1'],
                ['decode_bandwidth',  'HBM bandwidth limits token generation', 'ctx=512–2K, c=1–4'],
                ['saturation',        'Request queue exceeds GPU capacity',    'c ≥ 32, any ctx'],
                ['scheduler_queue',   'Requests wait in queue > GPU compute',  'c > 32, high ctx'],
                ['kv_cache_capacity', 'KV evictions degrade throughput',       'ctx ≥ 16K, c ≥ 8'],
                ['cpu_overhead',      'Python/tokenizer overhead dominates',   'ctx=512, c=1'],
              ].map(([cls, meaning, trigger]) => (
                <tr key={cls} className="even:bg-gray-50">
                  <Td><code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-700">{cls}</code></Td>
                  <Td muted={false}>{meaning}</Td>
                  <Td muted>{trigger}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <ChartImg src="/benchmarks/bottleneck_distribution.png"
            alt="Bottleneck distribution" caption="Figure 9.1: Bottleneck distribution — head-to-head full (224 cells). decode_bandwidth dominates at c≤8; saturation takes over at c≥32." />

          {/* ── Summary ────────────────────────────────────────────────── */}
          <SectionAnchor id="summary" title="Summary & Recommendations" />

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Choose SGLang when…</p>
              <ul className="space-y-2 text-sm text-blue-900">
                {[
                  'Repeated long system prompts (RAG, agents) — RadixAttention gives >1,000× TTFT reduction',
                  'Predictable tail latency required — SGLang p99 TTFT is consistently lower under load',
                  'Long-context inference (>32K) — FP8 KV + RadixAttention maximise effective throughput',
                  'Strict TTFT SLA at ctx=8K — vLLM breaches 500 ms; SGLang stays within SLO',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-5">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Choose vLLM when…</p>
              <ul className="space-y-2 text-sm text-orange-900">
                {[
                  'Minimum TTFT at ctx ≤ 2048 c=1 — vLLM is 7% faster (43 ms vs 46 ms)',
                  'Ecosystem integration: OpenAI-compatible API, structured-output, LoRA',
                  'NVLink TP=2 available — vLLM achieves higher scaling factor (2.90× vs 2.63×)',
                  'Batch pipelines where TTFT SLA is not the primary constraint',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl bg-[#16213E] text-white p-5 mb-8">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">Deployment Recommendations</p>
            <div className="space-y-3">
              {[
                ['Use TP=2 on every 2×H100 NVL node', '2.63–2.90× throughput at zero added GPU-hour cost per request.'],
                ['Cap concurrency at c=32 per instance', 'Beyond c=32 TPOT p99 crosses 50 ms. Scale horizontally instead.'],
                ['Enable FP8 KV for ctx ≥ 32K', 'Halves KV memory — enables 128K context on a single 94 GB H100.'],
                ['Route long-context to SGLang', 'RadixAttention eliminates repeat prefill for RAG / agent patterns.'],
                ['Alert on TPOT p99 > 45 ms', '90% of the SLA limit — time to react before users notice degradation.'],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-3">
                  <TrendingUp className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  <p className="text-sm"><span className="font-semibold text-white">{title}. </span>
                    <span className="text-slate-400">{body}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-4 text-sm">
            <a href={META.source} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium">
              <Github className="w-4 h-4" />Source code &amp; raw results
            </a>
            <Link href="/benchmarks/llm" className="text-gray-400 hover:text-gray-600">
              ← Back to benchmarks
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
