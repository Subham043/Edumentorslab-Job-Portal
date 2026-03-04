export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
];

export const APPLICATION_STATUS = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-800' },
  shortlisted: { label: 'Shortlisted', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  selected: { label: 'Selected', color: 'bg-purple-100 text-purple-800' },
};

export const SUBSCRIPTION_PLANS = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Post up to 2 jobs',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    name: 'Basic',
    price: 99,
    features: [
      'Post unlimited jobs',
      'View applicant profiles',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    name: 'Premium',
    price: 199,
    features: [
      'Everything in Basic',
      'Featured job listings',
      'Applicant tracking',
      'Dedicated account manager',
    ],
  },
];
