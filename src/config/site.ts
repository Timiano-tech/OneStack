// OneStack – Campus marketplace (SaaS)
// Launch campus: Federal University of Technology, Ilaro

export const SITE = {
  appName: 'OneStack',
  tagline: 'Campus marketplace for students',
  campus: {
    name: 'Federal University of Technology, Ilaro',
    shortName: 'FUT Ilaro',
    slug: 'fut-ilaro',
  },
  supportEmail: 'support@onestack.app',
} as const;

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'NGN',
    interval: 'forever',
    features: [
      'Up to 3 active listings',
      'Browse & message buyers/sellers',
      'Basic profile & reviews',
      'Campus-only visibility',
    ],
    limits: { listings: 3 },
  },
  premium: {
    name: 'Premium',
    price: 1999,
    currency: 'NGN',
    interval: 'month',
    features: [
      'Unlimited listings',
      'Boost listings to top (2 per month)',
      'Priority support',
      'Premium badge on profile',
      'Early access to new features',
    ],
    limits: { listings: Infinity, boostsPerMonth: 2 },
  },
} as const;
