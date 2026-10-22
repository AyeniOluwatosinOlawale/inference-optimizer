import { ExternalLink, BarChart3, Bell, Gauge } from 'lucide-react';

const GRAFANA_URL    = 'https://grafana.136.65.123.94.nip.io/dashboards';
const PROMETHEUS_URL = 'https://prometheus.136.65.123.94.nip.io/alerts';

const DASHBOARDS = [
  { name: 'vLLM Overview',     path: 'https://grafana.136.65.123.94.nip.io/d/vllm-overview',    desc: 'Queue depth, TTFT histogram, KV-cache %' },
  { name: 'GPU Utilization',   path: 'https://grafana.136.65.123.94.nip.io/d/gpu-utilization',  desc: 'SM utilization, memory used, power draw (DCGM)' },
  { name: 'LiteLLM Gateway',   path: 'https://grafana.136.65.123.94.nip.io/d/litellm-gateway',  desc: 'Req/s, p50/p99 latency, cache hit rate' },
];

const ALERT_RULES = [
  { name: 'VllmGpuCacheNearSaturation', expr: 'gpu_cache_usage_perc > 0.95', for: '2m', sev: 'critical' },
  { name: 'VllmRequestQueueSpiking',    expr: 'num_requests_waiting > 20',   for: '5m', sev: 'warning'  },
  { name: 'VllmPodCrashLooping',        expr: 'restarts > 3',                for: '5m', sev: 'critical' },
  { name: 'VllmPodNotReady',            expr: 'pod_ready == 0',              for: '3m', sev: 'critical' },
  { name: 'NodeProvisioningStalled',    expr: 'keda_active + nodes == 0',    for: '10m', sev: 'warning' },
  { name: 'PrometheusDiskPressure',     expr: 'tsdb_bytes / 45GB > 0.90',    for: '1m', sev: 'warning'  },
];

export function ObservabilitySection() {
  return (
    <div id="observability" className="mb-12 scroll-mt-24">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Observability</h2>
        <p className="text-sm text-gray-500">
          Live metrics, alerting rules, and autoscaling — publicly accessible via Traefik ingress.
        </p>
        <div className="mt-3 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
      </div>

      {/* Public URLs */}
      <div className="rounded-xl bg-[#16213E] text-white p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Live Public URLs</span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <a href={GRAFANA_URL} target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono text-teal-300 hover:text-teal-100 transition-colors">
            → {GRAFANA_URL}
          </a>
          <a href={PROMETHEUS_URL} target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono text-teal-300 hover:text-teal-100 transition-colors">
            → {PROMETHEUS_URL}
          </a>
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Grafana login</p>
          <code className="text-xs text-white">admin / llm-platform-admin</code>
        </div>
      </div>

      {/* Three metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Grafana */}
        <div className="rounded-xl border border-gray-200 p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Grafana</p>
              <p className="text-[11px] text-gray-400">Dashboards</p>
            </div>
            <a href={GRAFANA_URL} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-teal-600 hover:text-teal-700">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-2">
            {DASHBOARDS.map(d => (
              <a key={d.name} href={d.path} target="_blank" rel="noopener noreferrer"
                className="block rounded-lg bg-gray-50 hover:bg-teal-50 px-3 py-2 transition-colors">
                <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{d.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Prometheus */}
        <div className="rounded-xl border border-gray-200 p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Prometheus</p>
              <p className="text-[11px] text-gray-400">Alert Rules</p>
            </div>
            <a href={PROMETHEUS_URL} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-teal-600 hover:text-teal-700">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-1.5">
            {ALERT_RULES.map(r => (
              <div key={r.name} className="flex items-start gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  r.sev === 'critical' ? 'bg-red-500' : 'bg-amber-400'
                }`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-800 truncate">{r.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{r.expr} for {r.for}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Autoscaling */}
        <div className="rounded-xl border border-gray-200 p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Autoscaling</p>
              <p className="text-[11px] text-gray-400">KEDA + HPA</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'vLLM scaler',   metric: 'num_requests_waiting > 5',  action: 'scale up pods' },
              { label: 'LiteLLM HPA',   metric: 'CPU > 70%',                 action: 'scale gateway' },
              { label: 'Scale-to-zero', metric: 'queue idle for 10 min',     action: 'min 1 replica' },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  <span className="font-mono">{item.metric}</span> → {item.action}
                </p>
              </div>
            ))}
            <div className="rounded-lg bg-teal-50 border border-teal-100 px-3 py-2">
              <p className="text-[11px] text-teal-800 font-medium">
                Check KEDA ScaledObjects:
              </p>
              <code className="text-[10px] font-mono text-teal-700">
                kubectl get so -n llm-serving
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
