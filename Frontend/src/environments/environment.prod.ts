export const environment = {
  production: true,
  // Production API URLs on Render.com
  apiUrl: 'https://mandiapp-ordering-api.onrender.com/api',
  identityApiUrl: 'https://mandiapp-identity-api.onrender.com/api',
  marketplaceApiUrl: 'https://mandiapp-marketplace-api.onrender.com/api',
  orderingApiUrl: 'https://mandiapp-ordering-api.onrender.com/api',
  logisticsHubUrl: 'https://mandiapp-logistics-hub.onrender.com',
  trackingHubUrl: 'https://mandiapp-logistics-hub.onrender.com/hubs/tracking',
  priceHubUrl: 'https://mandiapp-ordering-api.onrender.com/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4', // TODO: Replace with production key
  useMockPayment: false, // Use real Razorpay in production
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
