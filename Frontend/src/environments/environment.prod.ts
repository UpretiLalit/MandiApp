export const environment = {
  production: true,
  apiUrl: 'http://140.245.9.144/api',
  identityApiUrl: 'http://140.245.9.144/api/identity',
  marketplaceApiUrl: 'http://140.245.9.144/api/marketplace',
  orderingApiUrl: 'http://140.245.9.144/api/ordering',
  logisticsHubUrl: 'http://140.245.9.144/api/logistics',
  trackingHubUrl: 'http://140.245.9.144/api/logistics/hubs/tracking',
  priceHubUrl: 'http://140.245.9.144/api/marketplace/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4',
  useMockPayment: true,
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
