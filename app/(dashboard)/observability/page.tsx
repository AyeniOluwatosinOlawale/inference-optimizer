import { ObservabilitySection } from '../benchmarks/llm/observability-section';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Observability — AnaModel Inference Platform',
};

export default function ObservabilityPage() {
  return (
    <>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-[#16213E] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <BarChart3 className="w-4 h-4" />
              AnaModel · Platform Observability
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
              Metrics, Alerts &amp; Autoscaling
            </h1>
            <p className="text-base text-slate-300 max-w-2xl">
              Grafana dashboards, Prometheus alert rules, and KEDA autoscaling — all running on GKE.
              Port-forward to access live metrics locally.
            </p>

            {/* Live metric pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label: 'Grafana',    status: 'Live',   color: 'bg-orange-500' },
                { label: 'Prometheus', status: 'Live',   color: 'bg-red-500'    },
                { label: 'KEDA',       status: 'Active',             color: 'bg-teal-500'   },
                { label: 'HPA',        status: 'Active',             color: 'bg-teal-500'   },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                  <span className={`w-2 h-2 rounded-full ${m.color}`} />
                  <span className="text-xs font-semibold text-white">{m.label}</span>
                  <span className="text-[11px] text-slate-400">{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/benchmarks/llm"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 mb-8 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Benchmarks
          </Link>

          <ObservabilitySection />

          {/* Stack summary */}
          <div className="rounded-xl border border-gray-200 p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Observability Stack</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Prometheus',       'Metrics scraping — vLLM, LiteLLM, DCGM GPU exporter, kube-state-metrics'],
                ['Grafana',          '3 pre-built dashboards provisioned via ConfigMap sidecar'],
                ['AlertManager',     '6 alert rules — GPU cache, queue spike, pod crash, disk pressure'],
                ['KEDA',             'Event-driven autoscaling on vllm:num_requests_waiting metric'],
                ['HPA',              'LiteLLM gateway scales on CPU > 70%'],
                ['Loki + FluentBit', 'Log aggregation from llm-serving and llm-gateway namespaces'],
              ].map(([tool, desc]) => (
                <div key={tool} className="flex gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                  <span className="text-teal-500 mt-0.5 shrink-0">→</span>
                  <p className="text-sm"><span className="font-semibold text-gray-900">{tool}. </span>
                    <span className="text-gray-500">{desc}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
