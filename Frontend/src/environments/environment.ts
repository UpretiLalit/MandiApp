export const environment = {
  production: false,
  // Using localhost - Tunnel DNS won't work until nameservers updated at domain registrar
  // TODO: Update mandimarket.com nameservers to Cloudflare (takes 24-48hrs)
  apiUrl: 'http://localhost:5002/api',
  identityApiUrl: 'http://localhost:5003/api',
  marketplaceApiUrl: 'http://localhost:5001/api',
  orderingApiUrl: 'http://localhost:5002/api',
  logisticsHubUrl: 'http://localhost:5004',
  trackingHubUrl: 'http://localhost:5004/hubs/tracking',
  priceHubUrl: 'http://localhost:5002/hubs/price',
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
