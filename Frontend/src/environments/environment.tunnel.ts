// Environment configuration for testing with Cloudflare Tunnel
// Use this when services are running locally but exposed via Cloudflare Tunnel
export const environment = {
  production: false,
  apiUrl: 'https://ordering-api.mandimarket.com/api',
  identityApiUrl: 'https://identity-api.mandimarket.com/api',
  marketplaceApiUrl: 'https://marketplace-api.mandimarket.com/api',
  orderingApiUrl: 'https://ordering-api.mandimarket.com/api',
  logisticsHubUrl: 'https://logistics-hub.mandimarket.com',
  trackingHubUrl: 'https://logistics-hub.mandimarket.com/hubs/tracking',
  priceHubUrl: 'https://ordering-api.mandimarket.com/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4', // Demo key - Get real key from https://dashboard.razorpay.com/app/keys
  useMockPayment: true, // Set to false when using real Razorpay credentials
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
