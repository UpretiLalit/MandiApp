# Mandi App - B2B Marketplace Platform

A comprehensive B2B marketplace platform for agricultural trading with real-time tracking, built with .NET 8 and Angular/Ionic.

## Architecture

This application follows a microservices architecture with:
- **Backend**: .NET 8 Web APIs with PostgreSQL
- **Frontend**: Angular 17+ with Ionic/Capacitor for mobile apps
- **Real-time**: ASP.NET Core SignalR for live GPS tracking
- **Authentication**: JWT-based with role-based access control

## Project Structure

```
MandiApp/
├── Backend/
│   ├── Services/
│   │   ├── Identity.API/          # Authentication & User Management
│   │   ├── Marketplace.API/       # Product Catalog & Pricing
│   │   ├── Ordering.API/          # Cart, Orders & Payments
│   │   └── Logistics.Hub/         # Real-time GPS Tracking
│   ├── Shared/
│   │   ├── Shared.Domain/         # Common domain models
│   │   └── Shared.Infrastructure/ # Shared utilities
│   └── MandiApp.sln
│
└── Frontend/
    └── src/
        ├── app/
        │   ├── core/              # Services, guards, interceptors
        │   └── pages/             # Feature modules
        └── environments/          # Configuration

```

## Prerequisites

### Backend
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- IDE: Visual Studio 2022 or VS Code

### Frontend
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- [Ionic CLI](https://ionicframework.com/docs/cli): `npm install -g @ionic/cli`

## Getting Started

### 1. Database Setup

Create PostgreSQL databases:
```sql
CREATE DATABASE MandiIdentityDB;
CREATE DATABASE MandiMarketplaceDB;
CREATE DATABASE MandiOrderingDB;
CREATE DATABASE MandiLogisticsDB;
```

### 2. Backend Setup

Navigate to each service and run migrations:

```bash
cd Backend/Services/Identity.API
dotnet ef database update

cd ../Marketplace.API
dotnet ef database update

cd ../Ordering.API
dotnet ef database update

cd ../Logistics.Hub
dotnet ef database update
```

### 3. Run Backend Services

Open multiple terminals and run each service:

```bash
# Terminal 1 - Identity API (Port 5001)
cd Backend/Services/Identity.API
dotnet run

# Terminal 2 - Marketplace API (Port 5002)
cd Backend/Services/Marketplace.API
dotnet run

# Terminal 3 - Ordering API (Port 5003)
cd Backend/Services/Ordering.API
dotnet run

# Terminal 4 - Logistics Hub (Port 5004)
cd Backend/Services/Logistics.Hub
dotnet run
```

### 4. Frontend Setup

```bash
cd Frontend
npm install
ionic serve
```

For mobile development:
```bash
# Build for Android
ionic capacitor add android
ionic capacitor run android

# Build for iOS (Mac only)
ionic capacitor add ios
ionic capacitor run ios
```

## Key Features

### For Buyers
- Browse products by category
- Real-time price updates
- Multi-vendor cart
- Order tracking with live GPS
- Payment gateway integration

### For Vendors
- Quick price update UI
- Inventory management
- Order fulfillment tracking
- Sales analytics

### For Transporters
- Delivery assignment
- GPS tracking
- QR code delivery confirmation
- Route optimization

## API Endpoints

### Identity API (Port 5001)
- POST `/api/auth/send-otp` - Send OTP for login
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/register` - Register new user
- GET `/api/auth/profile` - Get user profile

### Marketplace API (Port 5002)
- GET `/api/products` - Get all products
- GET `/api/products/{id}` - Get product details
- POST `/api/products` - Create product (Vendor)
- POST `/api/products/quick-price-update` - Update price (Vendor)

### Ordering API (Port 5003)
- GET `/api/cart` - Get cart
- POST `/api/cart/add` - Add to cart
- POST `/api/orders` - Create order
- GET `/api/orders/my-orders` - Get user orders

### Logistics Hub (Port 5004)
- GET `/api/delivery/order/{orderId}` - Get delivery info
- POST `/api/delivery/confirm-delivery` - Confirm delivery with QR
- WebSocket `/hubs/tracking` - Real-time GPS tracking

## Configuration

Update connection strings in `appsettings.json` for each service:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=YourDB;Username=postgres;Password=yourpassword"
  }
}
```

Update API URLs in `Frontend/src/environments/environment.ts`

## Technology Stack

- **Backend**: .NET 8, EF Core, PostgreSQL, SignalR
- **Frontend**: Angular 17, Ionic 7, Capacitor 5
- **State Management**: NgRx
- **Real-time**: SignalR
- **Authentication**: JWT
- **Payment**: Razorpay/Stripe integration ready

## Security

- JWT tokens with role-based authorization
- HTTPS enforced in production
- SQL injection prevention with EF Core
- XSS protection
- CORS configuration

## License

MIT License - feel free to use for commercial projects.

## Support

For issues and questions, please create an issue in the repository.
