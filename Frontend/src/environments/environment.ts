export const environment = {
  production: false,
  // Using Render.com production URLs - accessible from mobile devices
  apiUrl: 'https://mandiapp-ordering-api.onrender.com/api',
  identityApiUrl: 'https://mandiapp-identity-api.onrender.com/api',
  marketplaceApiUrl: 'https://mandiapp-marketplace-api.onrender.com/api',
  orderingApiUrl: 'https://mandiapp-ordering-api.onrender.com/api',
  logisticsHubUrl: 'https://mandiapp-logistics-hub.onrender.com',
  trackingHubUrl: 'https://mandiapp-logistics-hub.onrender.com/hubs/tracking',
  priceHubUrl: 'https://mandiapp-ordering-api.onrender.com/hubs/price',
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
