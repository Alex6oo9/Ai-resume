interface Props {
  onClose: () => void;
}

interface Plan {
  name: string;
  price: number;
  period: string;
  tier: string;
  features: readonly string[];
  savings?: string;
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Monthly',
    price: 5,
    period: 'month',
    tier: 'monthly',
    features: [
      'All premium templates',
      'Custom color themes',
      'Unlimited resumes',
      'AI-powered optimization',
    ],
  },
  {
    name: 'Annual',
    price: 30,
    period: 'year',
    tier: 'annual',
    savings: 'Save 50%',
    recommended: true,
    features: [
      'All premium + exclusive templates',
      'Custom color themes',
      'Unlimited resumes',
      'AI-powered optimization',
      'Priority support',
    ],
  },
];

export default function UpgradePrompt({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Unlock Premium Templates
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Stand out with professionally designed templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 grid md:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-5 relative ${
                plan.recommended ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              )}

              <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
              <div className="my-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>

              {plan.savings && (
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                  {plan.savings}
                </span>
              )}

              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-500 mt-0.5 flex-shrink-0">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  alert(
                    'Payment integration coming soon! Thank you for your interest.'
                  )
                }
                className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${
                  plan.recommended
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center pb-6 text-sm text-gray-500">
          <button
            onClick={onClose}
            className="text-blue-500 hover:underline"
          >
            Continue with free templates
          </button>
        </div>
      </div>
    </div>
  );
}
