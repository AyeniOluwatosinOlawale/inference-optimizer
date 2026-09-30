// Static benchmark data derived from inference-optimizer-lab2 results
// Hardware: 2×H100 NVL 94GB · SGLang v0.5.20 · vLLM v0.30.0 · Qwen3-8B

export const META = {
  model: 'Qwen/Qwen3-8B',
  hardware: '2 × NVIDIA H100 NVL 94 GB · NVLink 4.0 · CUDA 13.4',
  engines: ['SGLang v0.5.20', 'vLLM v0.30.0'],
  date: 'September 2026',
  source: 'https://github.com/AyeniOluwatosinOlawale/inference-optimizer-lab2',
};

export const HEADLINE = [
  { label: 'SGLang Peak TPS',    value: '2,148',   unit: 'tok/s',  detail: 'ctx=1024 c=1 single GPU' },
  { label: 'vLLM Peak TPS',      value: '2,058',   unit: 'tok/s',  detail: 'ctx=1024 c=1 single GPU' },
  { label: 'SGLang TP=2',        value: '5,646',   unit: 'tok/s',  detail: '2.63× NVLink speedup'    },
  { label: 'vLLM TP=2',          value: '5,965',   unit: 'tok/s',  detail: '2.90× NVLink speedup'    },
  { label: 'RadixAttn cache hit', value: '1,443×', unit: 'TTFT↓',  detail: '39ms vs 55,565ms @ 131K' },
  { label: 'Saturation cliff',   value: 'c = 32',  unit: 'conc.',  detail: 'TPOT p99 → SLA limit'    },
];

export const SLA = { ttft_ms: 500, e2e_ms: 10_000, tpot_ms: 50 };

// Use Case 1: Pareto table — SGLang, ctx=1024, random
export const UC1_PARETO = [
  { c: 1,  tps: 2148, ttft_p50: 46,  tpot_p50: 9.2,  tpot_p99: 10.1, tier: 'Latency optimal' },
  { c: 2,  tps: 2640, ttft_p50: 48,  tpot_p50: 9.4,  tpot_p99: 10.3, tier: 'Slightly higher latency' },
  { c: 4,  tps: 3210, ttft_p50: 52,  tpot_p50: 10.1, tpot_p99: 11.8, tier: 'Balanced' },
  { c: 8,  tps: 3890, ttft_p50: 61,  tpot_p50: 12.3, tpot_p99: 14.1, tier: 'Balanced' },
  { c: 16, tps: 4120, ttft_p50: 88,  tpot_p50: 18.7, tpot_p99: 22.4, tier: 'Throughput optimised' },
  { c: 32, tps: 4230, ttft_p50: 182, tpot_p50: 38.2, tpot_p99: 52.1, tier: 'SLA risk — TPOT↑' },
  { c: 64, tps: 4180, ttft_p50: 410, tpot_p50: 44.8, tpot_p99: 68.3, tier: 'Saturated' },
];

// Use Case 2: Percentile breakdown — ctx=2048, c=8, random
export const UC2_PERCENTILES = [
  { p: 'p25', sglang_ttft: 44.1, vllm_ttft: 41.2, sglang_tpot: 9.0,  vllm_tpot: 9.3  },
  { p: 'p50', sglang_ttft: 58.4, vllm_ttft: 55.8, sglang_tpot: 9.8,  vllm_tpot: 10.1 },
  { p: 'p75', sglang_ttft: 71.2, vllm_ttft: 70.1, sglang_tpot: 11.2, vllm_tpot: 11.9 },
  { p: 'p90', sglang_ttft: 82.4, vllm_ttft: 86.3, sglang_tpot: 13.4, vllm_tpot: 14.8 },
  { p: 'p99', sglang_ttft: 94.1, vllm_ttft: 108.2,sglang_tpot: 16.2, vllm_tpot: 18.1 },
];

// Use Case 3: Head-to-head key cells
export const UC3_HH = [
  { engine: 'SGLang', ctx: 512,  c: 1,  tps: 1821, ttft_p50: 33.3, ttft_p99: 41.2, tpot_p50: 9.0,  tpot_p99: 10.0 },
  { engine: 'vLLM',   ctx: 512,  c: 1,  tps: 1798, ttft_p50: 35.1, ttft_p99: 44.8, tpot_p50: 9.3,  tpot_p99: 10.4 },
  { engine: 'SGLang', ctx: 1024, c: 1,  tps: 2148, ttft_p50: 45.9, ttft_p99: 64.5, tpot_p50: 9.2,  tpot_p99: 10.0 },
  { engine: 'vLLM',   ctx: 1024, c: 1,  tps: 2058, ttft_p50: 42.8, ttft_p99: 58.3, tpot_p50: 9.6,  tpot_p99: 10.8 },
  { engine: 'SGLang', ctx: 2048, c: 8,  tps: 3412, ttft_p50: 58.4, ttft_p99: 94.1, tpot_p50: 9.8,  tpot_p99: 16.2 },
  { engine: 'vLLM',   ctx: 2048, c: 8,  tps: 3298, ttft_p50: 55.8, ttft_p99: 108.2,tpot_p50: 10.1, tpot_p99: 18.1 },
  { engine: 'SGLang', ctx: 8192, c: 1,  tps: 921,  ttft_p50: 462,  ttft_p99: 498,  tpot_p50: 9.4,  tpot_p99: 10.2 },
  { engine: 'vLLM',   ctx: 8192, c: 1,  tps: 844,  ttft_p50: 521,  ttft_p99: 562,  tpot_p50: 9.8,  tpot_p99: 10.9 },
  { engine: 'SGLang', ctx: 2048, c: 32, tps: 4180, ttft_p50: 182,  ttft_p99: 342,  tpot_p50: 38.2, tpot_p99: 52.1 },
  { engine: 'vLLM',   ctx: 2048, c: 32, tps: 4021, ttft_p50: 198,  ttft_p99: 371,  tpot_p50: 40.1, tpot_p99: 55.8 },
];

// Use Case 4: SLA / Goodput
export const UC4_GOODPUT = [
  { engine: 'SGLang', ctx: 512,  c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 33.3, ttft_p99: 41.2,  tpot_p99: 10.0 },
  { engine: 'vLLM',   ctx: 512,  c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 35.1, ttft_p99: 44.8,  tpot_p99: 10.4 },
  { engine: 'SGLang', ctx: 2048, c: 8,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 58.4, ttft_p99: 94.1,  tpot_p99: 16.2 },
  { engine: 'vLLM',   ctx: 2048, c: 8,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 55.8, ttft_p99: 108.2, tpot_p99: 18.1 },
  { engine: 'SGLang', ctx: 8192, c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 462,  ttft_p99: 498,   tpot_p99: 10.2 },
  { engine: 'vLLM',   ctx: 8192, c: 1,  wl: 'random',        ok: 100, goodput: 10,  ttft_p50: 521,  ttft_p99: 562,   tpot_p99: 10.9 },
  { engine: 'SGLang', ctx: 2048, c: 32, wl: 'random',        ok: 100, goodput: 65,  ttft_p50: 182,  ttft_p99: 342,   tpot_p99: 52.1 },
  { engine: 'vLLM',   ctx: 2048, c: 32, wl: 'random',        ok: 100, goodput: 58,  ttft_p50: 198,  ttft_p99: 371,   tpot_p99: 55.8 },
  { engine: 'SGLang', ctx: 2048, c: 4,  wl: 'shared_prefix', ok: 100, goodput: 100, ttft_p50: 31.2, ttft_p99: 38.4,  tpot_p99: 11.2 },
  { engine: 'vLLM',   ctx: 2048, c: 4,  wl: 'shared_prefix', ok: 100, goodput: 100, ttft_p50: 34.8, ttft_p99: 41.1,  tpot_p99: 11.8 },
];

// Use Case 5: Long-context
export const UC5_LONGCTX = [
  { ctx: 65536,  wl: 'random',        ttft_p50: 20923, tpot_p50: 10.5, tps: 98,   cache: 'Cold' },
  { ctx: 65536,  wl: 'shared_prefix', ttft_p50: 42,    tpot_p50: 9.7,  tps: 1007, cache: 'Hit'  },
  { ctx: 131072, wl: 'random',        ttft_p50: 55565, tpot_p50: 11.2, tps: 42,   cache: 'Cold' },
  { ctx: 131072, wl: 'shared_prefix', ttft_p50: 39,    tpot_p50: 10.1, tps: 1032, cache: 'Hit'  },
];

// Use Case 6: TP=2 scaling
export const UC6_TP2 = [
  { engine: 'SGLang', config: 'TP=1 (single GPU)', peak_tps: 2148, vs_tp1: null,    ttft_p50: 46, tpot_p50: 9.2  },
  { engine: 'SGLang', config: 'TP=2 (NVLink 4.0)', peak_tps: 5646, vs_tp1: '2.63×', ttft_p50: 31, tpot_p50: 6.8  },
  { engine: 'vLLM',   config: 'TP=1 (single GPU)', peak_tps: 2058, vs_tp1: null,    ttft_p50: 43, tpot_p50: 9.6  },
  { engine: 'vLLM',   config: 'TP=2 (NVLink 4.0)', peak_tps: 5965, vs_tp1: '2.90×', ttft_p50: 28, tpot_p50: 6.4  },
];

// Use Case 7: Saturation slices
export const UC7_SLICES = [
  { slice: 1, c: 1,  tps: 2148, ttft_p50: 46,  tpot_p50: 9.2,  tpot_p99: 10.0, sla: true  },
  { slice: 2, c: 2,  tps: 2640, ttft_p50: 48,  tpot_p50: 9.4,  tpot_p99: 10.3, sla: true  },
  { slice: 3, c: 4,  tps: 3210, ttft_p50: 52,  tpot_p50: 10.1, tpot_p99: 11.8, sla: true  },
  { slice: 4, c: 8,  tps: 3890, ttft_p50: 61,  tpot_p50: 12.3, tpot_p99: 14.1, sla: true  },
  { slice: 5, c: 16, tps: 4120, ttft_p50: 88,  tpot_p50: 18.7, tpot_p99: 22.4, sla: true  },
  { slice: 6, c: 32, tps: 4230, ttft_p50: 182, tpot_p50: 38.2, tpot_p99: 52.1, sla: false },
  { slice: 7, c: 64, tps: 4180, ttft_p50: 410, tpot_p50: 44.8, tpot_p99: 68.3, sla: false },
];
