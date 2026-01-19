export const environment = {
  production: false,
  apiUrl: 'http://localhost:5002/api',
  identityApiUrl: 'http://localhost:5003/api',
  marketplaceApiUrl: 'http://localhost:5002/api', // Use Ordering API for now
  orderingApiUrl: 'http://localhost:5002/api',
  logisticsHubUrl: 'http://localhost:5002',
  trackingHubUrl: 'http://localhost:5002/hubs/tracking',
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
