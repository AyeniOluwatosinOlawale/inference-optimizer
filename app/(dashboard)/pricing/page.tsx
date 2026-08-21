import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Developer',
    price: 0,
    period: 'free forever',
    highlight: false,
    tag: null,
    requests: '1,000 req/day',
    features: [
      '1,000 requests/day',
      'All 13 optimisations',
      'Model routing (Haiku → Opus)',
      'Prompt caching',
      'Basic dashboard',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/sign-up',
  },
  {
    name: 'Team',
    price: 49,
    period: 'per month',
    highlight: true,
    tag: 'Most popular',
    requests: '50,000 req/day',
    features: [
      '50,000 requests/day',
      'Everything in Developer',
      'Full savings dashboard',
      'API key management',
      'Team members (5 seats)',
      'Email support',
      '14-day free trial',
    ],
    cta: 'Start Trial',
    href: '/sign-up?plan=team',
  },
  {
    name: 'Pro',
    price: 199,
    period: 'per month',
    highlight: false,
    tag: null,
    requests: '500,000 req/day',
    features: [
      '500,000 requests/day',
      'Everything in Team',
      'Semantic caching',
      'Multi-provider routing',
      'Unlimited seats',
      'Priority support',
      'SLA guarantee',
    ],
    cta: 'Start Trial',
    href: '/sign-up?plan=pro',
  },
  {
    name: 'Business',
    price: null,
    period: 'custom',
    highlight: false,
    tag: null,
    requests: 'Unlimited',
    features: [
      'Unlimited requests',
      'Everything in Pro',
      'Custom model routing rules',
      'On-prem deployment option',
      'Dedicated support + Slack',
      'Custom SLA',
      'Savings-based pricing option',
    ],
    cta: 'Contact Us',
    href: 'mailto:hello@inferenceoptimizer.com',
  },
];

export default function PricingPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Pay for what you use. Keep the rest.
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
          Start free. Upgrade when the savings justify it, and they will.
          We also offer savings-based pricing for enterprise: you pay 15% of verified monthly savings.
        </p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-4 sm:p-6 flex flex-col ${
              plan.highlight
                ? 'bg-gray-900 text-white ring-2 ring-orange-500'
                : 'bg-white border border-gray-200'
            }`}
          >
            {plan.tag && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.tag}
                </span>
              </div>
            )}

            <div className="mb-5 sm:mb-6">
              <h2 className={`text-lg font-semibold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h2>
              <div className="flex items-end gap-1.5">
                {plan.price !== null ? (
                  <>
                    <span className={`text-3xl sm:text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      £{plan.price}
                    </span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{plan.period}
                    </span>
                  </>
                ) : (
                  <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    Custom
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.requests}
              </p>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-7 sm:mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-orange-400' : 'text-orange-500'}`} />
                  <span className={plan.highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>

            <Link href={plan.href}>
              <Button
                className={`w-full rounded-full ${
                  plan.highlight
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'variant-outline border-gray-300'
                }`}
                variant={plan.highlight ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Savings-based note */}
      <div className="mt-10 sm:mt-14 text-center bg-orange-50 border border-orange-100 rounded-2xl p-5 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Prefer savings-based pricing?
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-4 text-sm sm:text-base">
          For enterprise teams: pay 15% of your verified monthly savings instead of a flat fee.
          If we save you £20,000/month, you pay £3,000. If we save you nothing, you pay nothing.
        </p>
        <Link href="mailto:hello@inferenceoptimizer.com">
          <Button variant="outline" className="rounded-full">
            Talk to us about this
          </Button>
        </Link>
      </div>
    </main>
  );
}
