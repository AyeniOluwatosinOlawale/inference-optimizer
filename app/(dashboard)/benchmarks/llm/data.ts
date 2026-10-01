// Benchmark data computed from inference-optimizer-lab2 raw results
// Hardware: 2×H100 NVL 94GB · SGLang v0.5.20 · vLLM v0.30.0 · Qwen3-8B

export const META = {
  model: 'Qwen/Qwen3-8B',
  hardware: '2 × NVIDIA H100 NVL 94 GB · NVLink 4.0 · CUDA 13.4',
  engines: ['SGLang v0.5.20', 'vLLM v0.30.0'],
  date: 'September 2026',
  source: 'https://github.com/AyeniOluwatosinOlawale/inference-optimizer-lab2',
};

export const HEADLINE = [
  { label: 'SGLang Peak TPS',     value: '2,175',   unit: 'tok/s',  detail: 'ctx=1024 c=1 single GPU' },
  { label: 'vLLM Peak TPS',       value: '2,053',   unit: 'tok/s',  detail: 'ctx=1024 c=1 single GPU' },
  { label: 'SGLang TP=2',         value: '5,646',   unit: 'tok/s',  detail: '2.63× NVLink speedup'    },
  { label: 'vLLM TP=2',           value: '5,965',   unit: 'tok/s',  detail: '2.90× NVLink speedup'    },
  { label: 'RadixAttn TTFT↓',     value: '1,443×',  unit: 'speedup',detail: '39 ms vs 55,565 ms @ 131K' },
  { label: 'E2E SLA compliance',   value: '100%',    unit: 'goodput',detail: 'ctx≤8K c≤16 all workloads' },
];

export const SLA = { ttft_ms: 500, e2e_ms: 10_000, tpot_ms: 50 };

// ── UC1: SGLang Pareto — ctx=1024, random workload ───────────────────────────
// Fields: TPS, TTFT (p50/p90/p99), TPOT (p50/p90/p99), E2E (p50/p99), Queue p50
export const UC1_PARETO = [
  { c: 1,   tps: 2175, ttft_p50: 34.1,  ttft_p90: 36.2,  ttft_p99: 37.0,  tpot_p50: 9.07,  tpot_p90: 9.76,  tpot_p99: 9.8,   e2e_p50: 3102, e2e_p99: 3104, q_p50: 31033, tier: 'Latency optimal'    },
  { c: 2,   tps: 2067, ttft_p50: 56.6,  ttft_p90: 58.8,  ttft_p99: 59.8,  tpot_p50: 9.55,  tpot_p90: 10.32, tpot_p99: 10.66, e2e_p50: 3285, e2e_p99: 3289, q_p50: 16429, tier: 'Slightly higher latency' },
  { c: 4,   tps: 1974, ttft_p50: 69.4,  ttft_p90: 101.9, ttft_p99: 102.2, tpot_p50: 9.9,   tpot_p90: 10.76, tpot_p99: 10.88, e2e_p50: 3388, e2e_p99: 3423, q_p50: 6777,  tier: 'Balanced'            },
  { c: 8,   tps: 1933, ttft_p50: 72.7,  ttft_p90: 95.8,  ttft_p99: 102.4, tpot_p50: 10.16, tpot_p90: 10.66, tpot_p99: 10.95, e2e_p50: 3528, e2e_p99: 3541, q_p50: 3523,  tier: 'Balanced'            },
  { c: 16,  tps: 1735, ttft_p50: 108.6, ttft_p90: 138.5, ttft_p99: 138.7, tpot_p50: 11.22, tpot_p90: 11.84, tpot_p99: 12.43, e2e_p50: 3929, e2e_p99: 3935, q_p50: 0,     tier: 'Throughput optimised' },
  { c: 32,  tps: 1487, ttft_p50: 135.3, ttft_p90: 155.2, ttft_p99: 161.3, tpot_p50: 13.22, tpot_p90: 14.18, tpot_p99: 14.59, e2e_p50: 4608, e2e_p99: 4615, q_p50: 0,     tier: 'Saturation region'   },
  { c: 64,  tps: 1477, ttft_p50: 126.1, ttft_p90: 151.2, ttft_p99: 154.6, tpot_p50: 13.23, tpot_p90: 14.2,  tpot_p99: 14.62, e2e_p50: 4613, e2e_p99: 4618, q_p50: 0,     tier: 'Saturated'           },
  { c: 128, tps: 1484, ttft_p50: 132.0, ttft_p90: 149.7, ttft_p99: 151.8, tpot_p50: 13.25, tpot_p90: 14.24, tpot_p99: 14.52, e2e_p50: 4605, e2e_p99: 4609, q_p50: 0,     tier: 'Saturated'           },
];

// ── UC1: vLLM Pareto — ctx=1024, random workload ─────────────────────────────
export const UC1_VLLM_PARETO = [
  { c: 1,   tps: 2053, ttft_p50: 42.8,  ttft_p90: 46.3,  ttft_p99: 46.7,  tpot_p50: 9.62,  tpot_p90: 10.31, tpot_p99: 10.97, e2e_p50: 3312, e2e_p99: 3315, q_p50: 33123, tier: 'Latency optimal'    },
  { c: 2,   tps: 2029, ttft_p50: 59.4,  ttft_p90: 65.3,  ttft_p99: 68.5,  tpot_p50: 9.8,   tpot_p90: 10.66, tpot_p99: 11.02, e2e_p50: 3335, e2e_p99: 3351, q_p50: 16677, tier: 'Slightly higher latency' },
  { c: 4,   tps: 1965, ttft_p50: 71.1,  ttft_p90: 95.8,  ttft_p99: 97.0,  tpot_p50: 9.96,  tpot_p90: 10.46, tpot_p99: 11.32, e2e_p50: 3443, e2e_p99: 3475, q_p50: 6905,  tier: 'Balanced'            },
  { c: 8,   tps: 1890, ttft_p50: 78.1,  ttft_p90: 103.2, ttft_p99: 104.5, tpot_p50: 10.35, tpot_p90: 10.73, tpot_p99: 11.23, e2e_p50: 3554, e2e_p99: 3593, q_p50: 3555,  tier: 'Balanced'            },
  { c: 16,  tps: 1731, ttft_p50: 145.6, ttft_p90: 149.1, ttft_p99: 151.9, tpot_p50: 11.12, tpot_p90: 11.78, tpot_p99: 12.26, e2e_p50: 3895, e2e_p99: 3917, q_p50: 0,     tier: 'Throughput optimised' },
  { c: 32,  tps: 1489, ttft_p50: 162.4, ttft_p90: 170.8, ttft_p99: 171.1, tpot_p50: 12.96, tpot_p90: 14.22, tpot_p99: 14.27, e2e_p50: 4543, e2e_p99: 4551, q_p50: 0,     tier: 'Saturation region'   },
  { c: 64,  tps: 1499, ttft_p50: 157.8, ttft_p90: 163.5, ttft_p99: 166.8, tpot_p50: 12.95, tpot_p90: 14.22, tpot_p99: 14.27, e2e_p50: 4538, e2e_p99: 4547, q_p50: 0,     tier: 'Saturated'           },
  { c: 128, tps: 1495, ttft_p50: 179.2, ttft_p90: 190.1, ttft_p99: 192.2, tpot_p50: 12.96, tpot_p90: 14.23, tpot_p99: 14.27, e2e_p50: 4561, e2e_p99: 4574, q_p50: 0,     tier: 'Saturated'           },
];

// ── UC1: Shared-prefix vs random TTFT speedup — SGLang, c=4 ──────────────────
export const UC1_PREFIX_SPEEDUP = [
  { ctx: 2048,  rand_ttft_p50: 75.5,  rand_ttft_p99: 81.9,  pref_ttft_p50: 52.7, pref_ttft_p99: 89.3, speedup: 1.4 },
  { ctx: 4096,  rand_ttft_p50: 88.9,  rand_ttft_p99: 108.9, pref_ttft_p50: 69.6, pref_ttft_p99: 73.7, speedup: 1.3 },
  { ctx: 8192,  rand_ttft_p50: 90.8,  rand_ttft_p99: 122.9, pref_ttft_p50: 69.6, pref_ttft_p99: 72.7, speedup: 1.3 },
  { ctx: 16384, rand_ttft_p50: 126.7, rand_ttft_p99: 166.3, pref_ttft_p50: 69.4, pref_ttft_p99: 71.2, speedup: 1.8 },
  { ctx: 32768, rand_ttft_p50: 156.1, rand_ttft_p99: 222.0, pref_ttft_p50: 68.9, pref_ttft_p99: 70.9, speedup: 2.3 },
];

// ── UC2: Percentile breakdown — ctx=2048, c=8, random ────────────────────────
// Fields: TTFT, TPOT, E2E latency, ITL — all in ms
export const UC2_PERCENTILES = [
  { p: 'p25', sglang_ttft: 82.3,  vllm_ttft: 99.3,  sglang_tpot: 10.48, vllm_tpot: 10.45, sglang_e2e: 3685, vllm_e2e: 3727, sglang_itl: 14.01, vllm_itl: 14.20 },
  { p: 'p50', sglang_ttft: 87.8,  vllm_ttft: 108.5, sglang_tpot: 10.70, vllm_tpot: 10.79, sglang_e2e: 3688, vllm_e2e: 3737, sglang_itl: 14.07, vllm_itl: 14.21 },
  { p: 'p75', sglang_ttft: 103.6, vllm_ttft: 130.7, sglang_tpot: 11.22, vllm_tpot: 11.11, sglang_e2e: 3693, vllm_e2e: 3757, sglang_itl: 14.12, vllm_itl: 14.22 },
  { p: 'p90', sglang_ttft: 108.8, vllm_ttft: 133.2, sglang_tpot: 11.46, vllm_tpot: 11.38, sglang_e2e: 3695, vllm_e2e: 3759, sglang_itl: 14.14, vllm_itl: 14.23 },
  { p: 'p99', sglang_ttft: 111.0, vllm_ttft: 133.7, sglang_tpot: 11.65, vllm_tpot: 11.57, sglang_e2e: 3695, vllm_e2e: 3759, sglang_itl: 14.15, vllm_itl: 14.26 },
];

// ── UC3: Head-to-Head — key cells, random workload ───────────────────────────
// Fields: TPS, TTFT (p50/p99), TPOT (p50/p99), E2E (p50/p99)
export const UC3_HH = [
  { engine: 'SGLang', ctx: 512,  c: 1,  tps: 2127, ttft_p50: 56.4,  ttft_p99: 65.6,  tpot_p50: 9.19,  tpot_p99: 10.03, e2e_p50: 3117, e2e_p99: 3138 },
  { engine: 'vLLM',   ctx: 512,  c: 1,  tps: 2001, ttft_p50: 63.5,  ttft_p99: 67.4,  tpot_p50: 9.88,  tpot_p99: 10.47, e2e_p50: 3322, e2e_p99: 3345 },
  { engine: 'SGLang', ctx: 512,  c: 4,  tps: 2011, ttft_p50: 53.8,  ttft_p99: 59.5,  tpot_p50: 9.82,  tpot_p99: 10.79, e2e_p50: 3336, e2e_p99: 3339 },
  { engine: 'vLLM',   ctx: 512,  c: 4,  tps: 1929, ttft_p50: 64.1,  ttft_p99: 84.0,  tpot_p50: 10.23, tpot_p99: 10.94, e2e_p50: 3407, e2e_p99: 3431 },
  { engine: 'SGLang', ctx: 1024, c: 1,  tps: 2149, ttft_p50: 65.9,  ttft_p99: 72.0,  tpot_p50: 9.12,  tpot_p99: 10.08, e2e_p50: 3132, e2e_p99: 3136 },
  { engine: 'vLLM',   ctx: 1024, c: 1,  tps: 2058, ttft_p50: 73.8,  ttft_p99: 80.4,  tpot_p50: 9.62,  tpot_p99: 10.35, e2e_p50: 3337, e2e_p99: 3345 },
  { engine: 'SGLang', ctx: 1024, c: 8,  tps: 1924, ttft_p50: 76.8,  ttft_p99: 103.3, tpot_p50: 10.16, tpot_p99: 10.91, e2e_p50: 3529, e2e_p99: 3544 },
  { engine: 'vLLM',   ctx: 1024, c: 8,  tps: 1905, ttft_p50: 105.5, ttft_p99: 119.8, tpot_p50: 10.23, tpot_p99: 10.89, e2e_p50: 3584, e2e_p99: 3596 },
  { engine: 'SGLang', ctx: 2048, c: 8,  tps: 1800, ttft_p50: 87.8,  ttft_p99: 111.0, tpot_p50: 10.70, tpot_p99: 11.65, e2e_p50: 3688, e2e_p99: 3695 },
  { engine: 'vLLM',   ctx: 2048, c: 8,  tps: 1788, ttft_p50: 108.5, ttft_p99: 133.7, tpot_p50: 10.79, tpot_p99: 11.57, e2e_p50: 3737, e2e_p99: 3759 },
  { engine: 'SGLang', ctx: 8192, c: 1,  tps: 1834, ttft_p50: 378.3, ttft_p99: 384.8, tpot_p50: 9.84,  tpot_p99: 11.13, e2e_p50: 3628, e2e_p99: 3634 },
  { engine: 'vLLM',   ctx: 8192, c: 1,  tps: 1748, ttft_p50: 379.1, ttft_p99: 386.4, tpot_p50: 10.41, tpot_p99: 11.76, e2e_p50: 3821, e2e_p99: 3827 },
  { engine: 'SGLang', ctx: 2048, c: 32, tps: 1282, ttft_p50: 140.2, ttft_p99: 173.3, tpot_p50: 15.25, tpot_p99: 16.74, e2e_p50: 5236, e2e_p99: 5243 },
  { engine: 'vLLM',   ctx: 2048, c: 32, tps: 1276, ttft_p50: 221.7, ttft_p99: 235.7, tpot_p50: 15.05, tpot_p99: 18.32, e2e_p50: 5204, e2e_p99: 5215 },
];

// ── UC4: Goodput / SLA — key cells ───────────────────────────────────────────
// Fields: success%, goodput%, TTFT (p50/p99), TPOT p99, E2E p99, SLA status
export const UC4_GOODPUT = [
  { engine: 'SGLang', ctx: 512,  c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 45.9,  ttft_p99: 64.5,  tpot_p99: 10.0, e2e_p99: 3136  },
  { engine: 'vLLM',   ctx: 512,  c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 58.3,  ttft_p99: 67.4,  tpot_p99: 10.5, e2e_p99: 3345  },
  { engine: 'SGLang', ctx: 2048, c: 8,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 87.8,  ttft_p99: 110.6, tpot_p99: 11.6, e2e_p99: 3695  },
  { engine: 'vLLM',   ctx: 2048, c: 8,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 108.5, ttft_p99: 133.7, tpot_p99: 11.6, e2e_p99: 3759  },
  { engine: 'SGLang', ctx: 8192, c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 219.0, ttft_p99: 384.1, tpot_p99: 11.0, e2e_p99: 3633  },
  { engine: 'vLLM',   ctx: 8192, c: 1,  wl: 'random',        ok: 100, goodput: 100, ttft_p50: 229.1, ttft_p99: 386.4, tpot_p99: 11.7, e2e_p99: 3827  },
  { engine: 'SGLang', ctx: 8192, c: 32, wl: 'random',        ok: 100, goodput: 100, ttft_p50: 265.9, ttft_p99: 289.4, tpot_p99: 29.1, e2e_p99: 9057  },
  { engine: 'vLLM',   ctx: 8192, c: 32, wl: 'random',        ok: 100, goodput: 100, ttft_p50: 283.1, ttft_p99: 425.0, tpot_p99: 29.7, e2e_p99: 8994  },
  { engine: 'SGLang', ctx: 2048, c: 4,  wl: 'shared_prefix', ok: 100, goodput: 100, ttft_p50: 66.8,  ttft_p99: 69.3,  tpot_p99: 11.3, e2e_p99: 3392  },
  { engine: 'vLLM',   ctx: 2048, c: 4,  wl: 'shared_prefix', ok: 100, goodput: 100, ttft_p50: 69.9,  ttft_p99: 82.6,  tpot_p99: 11.6, e2e_p99: 3456  },
];

// ── UC5: Long-context RadixAttention ─────────────────────────────────────────
export const UC5_LONGCTX = [
  { ctx: 65536,  wl: 'random',        ttft_p50: 20923, tpot_p50: 10.5, tps: 98,   cache: 'Cold' },
  { ctx: 65536,  wl: 'shared_prefix', ttft_p50: 42,    tpot_p50: 9.7,  tps: 1007, cache: 'Hit'  },
  { ctx: 131072, wl: 'random',        ttft_p50: 55565, tpot_p50: 11.2, tps: 42,   cache: 'Cold' },
  { ctx: 131072, wl: 'shared_prefix', ttft_p50: 39,    tpot_p50: 10.1, tps: 1032, cache: 'Hit'  },
];

// ── UC6: TP=2 scaling ────────────────────────────────────────────────────────
export const UC6_TP2 = [
  { engine: 'SGLang', config: 'TP=1 (single GPU)', peak_tps: 2175, vs_tp1: null,    ttft_p50: 34.1, tpot_p50: 9.07 },
  { engine: 'SGLang', config: 'TP=2 (NVLink 4.0)', peak_tps: 5646, vs_tp1: '2.63×', ttft_p50: 31,   tpot_p50: 6.8  },
  { engine: 'vLLM',   config: 'TP=1 (single GPU)', peak_tps: 2053, vs_tp1: null,    ttft_p50: 42.8, tpot_p50: 9.62 },
  { engine: 'vLLM',   config: 'TP=2 (NVLink 4.0)', peak_tps: 5965, vs_tp1: '2.90×', ttft_p50: 28,   tpot_p50: 6.4  },
];

// ── UC7: Saturation slices — SGLang, ctx=1024, random ────────────────────────
// Fields: TTFT (p50/p99), TPOT (p50/p99), E2E p99, Queue p50, SLA pass/fail
export const UC7_SLICES = [
  { slice: 1, c: 1,   tps: 2175, ttft_p50: 34.1,  ttft_p99: 37.0,  tpot_p50: 9.07,  tpot_p99: 9.8,   e2e_p99: 3104, q_p50: 31033, sla: true  },
  { slice: 2, c: 2,   tps: 2067, ttft_p50: 56.6,  ttft_p99: 59.8,  tpot_p50: 9.55,  tpot_p99: 10.66, e2e_p99: 3289, q_p50: 16429, sla: true  },
  { slice: 3, c: 4,   tps: 1974, ttft_p50: 69.4,  ttft_p99: 102.2, tpot_p50: 9.9,   tpot_p99: 10.88, e2e_p99: 3423, q_p50: 6777,  sla: true  },
  { slice: 4, c: 8,   tps: 1933, ttft_p50: 72.7,  ttft_p99: 102.4, tpot_p50: 10.16, tpot_p99: 10.95, e2e_p99: 3541, q_p50: 3523,  sla: true  },
  { slice: 5, c: 16,  tps: 1735, ttft_p50: 108.6, ttft_p99: 138.7, tpot_p50: 11.22, tpot_p99: 12.43, e2e_p99: 3935, q_p50: 0,     sla: true  },
  { slice: 6, c: 32,  tps: 1487, ttft_p50: 135.3, ttft_p99: 161.3, tpot_p50: 13.22, tpot_p99: 14.59, e2e_p99: 4615, q_p50: 0,     sla: true  },
  { slice: 7, c: 64,  tps: 1477, ttft_p50: 126.1, ttft_p99: 154.6, tpot_p50: 13.23, tpot_p99: 14.62, e2e_p99: 4618, q_p50: 0,     sla: true  },
  { slice: 8, c: 128, tps: 1484, ttft_p50: 132.0, ttft_p99: 151.8, tpot_p50: 13.25, tpot_p99: 14.52, e2e_p99: 4609, q_p50: 0,     sla: true  },
];
