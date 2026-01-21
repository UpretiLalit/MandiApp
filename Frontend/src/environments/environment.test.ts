export const environment = {
  production: false,
  apiUrl: 'http://localhost:5002/api',
  identityApiUrl: 'http://localhost:5003/api',
  marketplaceApiUrl: 'http://localhost:5001/api',
  orderingApiUrl: 'http://localhost:5002/api',
  logisticsHubUrl: 'http://localhost:5002',
  trackingHubUrl: 'http://localhost:5002/hubs/tracking',
  priceHubUrl: 'http://localhost:5002/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4', // Test key
  useMockPayment: true,
  enableRealTimeFeatures: true,
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },
  // Supabase (for direct access if needed)
  supabase: {
    url: 'https://iytscokxxuxprrivmzvg.supabase.co',
    anonKey: 'your-anon-key-here' // Get from Supabase dashboard
  }
};
