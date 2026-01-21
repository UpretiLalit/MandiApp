# 🏗️ Architecture Refactoring Plan - .NET 8 Best Practices

## 📋 Current Issues Identified

### ❌ **Problems in Current Code:**

1. **Services directly access DbContext** - Violates Repository pattern
2. **No DTOs in many places** - Entities exposed directly to controllers
3. **No AutoMapper** - Manual mapping scattered everywhere
4. **Controllers have business logic** - Should be thin wrappers
5. **No Builder Pattern** - Complex Order creation is messy
6. **Payment gateway hardcoded** - No abstraction for Razorpay/Stripe
7. **No Unit Tests** - Zero test coverage
8. **No Integration Tests** - No end-to-end testing
9. **Exceptions thrown as strings** - Should use custom exceptions
10. **No validation attributes** - DTOs lack validation

---

## 🎯 Target Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers (Thin - Route + Return IActionResult) │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Services (Business Logic + Orchestration)        │  │
│  │  - OrderService, PaymentService, etc.            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DTOs (Request/Response Models)                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Mappers (AutoMapper Profiles)                    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Builders (Complex Object Construction)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Domain Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Entities (Business Models)                       │  │
│  │  - Order, Payment, Vendor, Transporter           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Interfaces (Contracts)                           │  │
│  │  - IPaymentGateway, INotificationService         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Repositories (Data Access)                       │  │
│  │  - OrderRepository, PaymentRepository            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  External Services                                │  │
│  │  - RazorpayGateway, StripeGateway, SMS, Email   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DbContext (EF Core)                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Phases

### **Phase 1: Foundation (Day 1)**
✅ Setup project structure
✅ Install required packages
✅ Create base interfaces and abstractions

### **Phase 2: Repository Pattern (Day 1-2)**
✅ Create IRepository<T> and BaseRepository<T>
✅ Implement OrderRepository, PaymentRepository, etc.
✅ Update services to use repositories

### **Phase 3: DTOs & Mapping (Day 2)**
✅ Create comprehensive DTOs for all entities
✅ Setup AutoMapper profiles
✅ Add validation attributes

### **Phase 4: Builder Pattern (Day 2-3)**
✅ Create OrderBuilder for complex order creation
✅ Create PaymentBuilder
✅ Refactor existing code to use builders

### **Phase 5: Payment Gateway Abstraction (Day 3)**
✅ Create IPaymentGateway interface
✅ Implement RazorpayGateway and StripeGateway
✅ Add payment gateway factory

### **Phase 6: Unit Tests (Day 3-4)**
✅ Setup xUnit test project
✅ Mock repositories with Moq
✅ Test all service methods
✅ Aim for 80%+ code coverage

### **Phase 7: Integration Tests (Day 4-5)**
✅ Setup WebApplicationFactory
✅ Test full API endpoints
✅ Test database operations with in-memory DB

### **Phase 8: Exception Handling (Day 5)**
✅ Create custom exception classes
✅ Add global exception middleware
✅ Return consistent error responses

---

## 📦 Required NuGet Packages

```xml
<!-- Ordering.API.csproj -->
<ItemGroup>
  <!-- Mapping -->
  <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
  
  <!-- Validation -->
  <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
  
  <!-- Payment Gateways -->
  <PackageReference Include="Razorpay" Version="3.1.0" />
  <PackageReference Include="Stripe.net" Version="43.0.0" />
</ItemGroup>

<!-- Create: Ordering.API.Tests.csproj -->
<ItemGroup>
  <!-- Testing Framework -->
  <PackageReference Include="xunit" Version="2.6.5" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
  
  <!-- Mocking -->
  <PackageReference Include="Moq" Version="4.20.70" />
  
  <!-- Integration Testing -->
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
  
  <!-- In-Memory Database -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
  
  <!-- Assertions -->
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
</ItemGroup>
```

---

## 📁 New Folder Structure

```
Ordering.API/
├── Controllers/          (Thin - only routing)
├── Services/             (Business logic)
│   ├── Interfaces/
│   │   ├── IOrderService.cs
│   │   ├── IPaymentService.cs
│   │   └── INotificationService.cs
│   ├── OrderService.cs
│   ├── PaymentService.cs
│   └── NotificationService.cs
├── Repositories/         (NEW - Data access)
│   ├── Interfaces/
│   │   ├── IRepository.cs
│   │   ├── IOrderRepository.cs
│   │   └── IPaymentRepository.cs
│   ├── BaseRepository.cs
│   ├── OrderRepository.cs
│   └── PaymentRepository.cs
├── Builders/             (NEW - Complex object creation)
│   ├── OrderBuilder.cs
│   └── PaymentBuilder.cs
├── Mappers/              (NEW - AutoMapper profiles)
│   ├── OrderMappingProfile.cs
│   ├── PaymentMappingProfile.cs
│   └── VendorMappingProfile.cs
├── DTOs/
│   ├── Requests/
│   │   ├── CreateOrderRequest.cs
│   │   └── InitiatePaymentRequest.cs
│   ├── Responses/
│   │   ├── OrderResponse.cs
│   │   └── PaymentResponse.cs
│   └── Validators/       (NEW - FluentValidation)
│       ├── CreateOrderRequestValidator.cs
│       └── InitiatePaymentRequestValidator.cs
├── Gateways/             (NEW - External service abstractions)
│   ├── Interfaces/
│   │   └── IPaymentGateway.cs
│   ├── RazorpayGateway.cs
│   └── StripeGateway.cs
├── Exceptions/           (NEW - Custom exceptions)
│   ├── OrderNotFoundException.cs
│   ├── PaymentFailedException.cs
│   └── InsufficientInventoryException.cs
├── Middleware/           (NEW - Global error handling)
│   └── ExceptionHandlingMiddleware.cs
└── Models/               (Domain entities - unchanged)

Ordering.API.Tests/       (NEW - Test project)
├── UnitTests/
│   ├── Services/
│   │   ├── OrderServiceTests.cs
│   │   ├── PaymentServiceTests.cs
│   │   └── CartServiceTests.cs
│   ├── Builders/
│   │   └── OrderBuilderTests.cs
│   └── Validators/
│       └── CreateOrderRequestValidatorTests.cs
├── IntegrationTests/
│   ├── Controllers/
│   │   ├── OrdersControllerTests.cs
│   │   └── PaymentsControllerTests.cs
│   └── Repositories/
│       └── OrderRepositoryTests.cs
└── Helpers/
    ├── TestFixture.cs
    └── MockDataFactory.cs
```

---

## 🎯 SOLID Principles Implementation

### **S - Single Responsibility**

**❌ Before:**
```csharp
public class OrderService {
    public async Task CreateOrder() {
        // Create order
        // Send email
        // Send SMS
        // Update inventory
        // Process payment
    }
}
```

**✅ After:**
```csharp
public class OrderService {
    private readonly IOrderRepository _orderRepo;
    private readonly INotificationService _notification;
    private readonly IInventoryService _inventory;
    private readonly IPaymentService _payment;
    
    public async Task<OrderResponse> CreateOrder(CreateOrderRequest request) {
        var order = await _orderRepo.CreateAsync(request);
        await _notification.NotifyVendor(order);
        await _inventory.ReserveStock(order);
        await _payment.InitiatePayment(order);
        return _mapper.Map<OrderResponse>(order);
    }
}
```

---

### **O - Open/Closed**

**❌ Before:**
```csharp
public class PaymentService {
    public async Task ProcessPayment(string gateway) {
        if (gateway == "Razorpay") {
            // Razorpay logic
        } else if (gateway == "Stripe") {
            // Stripe logic
        }
    }
}
```

**✅ After:**
```csharp
public interface IPaymentGateway {
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
}

public class RazorpayGateway : IPaymentGateway {
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request) {
        // Razorpay implementation
    }
}

public class StripeGateway : IPaymentGateway {
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request) {
        // Stripe implementation
    }
}

// Adding new gateway = just create new class implementing IPaymentGateway
```

---

### **L - Liskov Substitution**

**✅ Implementation:**
```csharp
public interface IVehicle {
    decimal CalculateShippingCost(decimal distance, decimal weight);
}

public class BikeVehicle : IVehicle {
    public decimal CalculateShippingCost(decimal distance, decimal weight) {
        return distance * 5; // ₹5/km
    }
}

public class TruckVehicle : IVehicle {
    public decimal CalculateShippingCost(decimal distance, decimal weight) {
        return (distance * 10) + (weight * 2); // ₹10/km + ₹2/kg
    }
}

// Any IVehicle can be used interchangeably
IVehicle vehicle = weightRequirement > 50 ? new TruckVehicle() : new BikeVehicle();
var cost = vehicle.CalculateShippingCost(distance, weight);
```

---

### **I - Interface Segregation**

**❌ Before:**
```csharp
public interface IUser {
    void BuyProducts();
    void SellProducts();
    void DeliverProducts();
    void ApproveKYC();
}

// Vendor forced to implement BuyProducts (doesn't make sense!)
public class Vendor : IUser {
    public void BuyProducts() => throw new NotImplementedException();
    public void SellProducts() { /* implementation */ }
    public void DeliverProducts() => throw new NotImplementedException();
    public void ApproveKYC() => throw new NotImplementedException();
}
```

**✅ After:**
```csharp
public interface IBuyer {
    Task PlaceOrderAsync(Order order);
}

public interface IVendor {
    Task ListProductAsync(Product product);
    Task UpdateInventoryAsync(string productId, int quantity);
}

public interface ITransporter {
    Task AcceptDeliveryAsync(string orderId);
    Task UpdateLocationAsync(double lat, double lng);
}

public interface IAdmin {
    Task ApproveKYCAsync(string userId);
    Task SuspendUserAsync(string userId);
}

// Each role implements only what it needs
public class Vendor : IVendor {
    public async Task ListProductAsync(Product product) { /* implementation */ }
    public async Task UpdateInventoryAsync(string productId, int quantity) { /* implementation */ }
}
```

---

### **D - Dependency Inversion**

**❌ Before:**
```csharp
public class OrderService {
    private readonly SqlOrderRepository _orderRepo; // Depends on concrete class
    
    public OrderService() {
        _orderRepo = new SqlOrderRepository(); // Creates dependency
    }
}
```

**✅ After:**
```csharp
public class OrderService {
    private readonly IOrderRepository _orderRepo; // Depends on abstraction
    
    public OrderService(IOrderRepository orderRepo) { // Injected via constructor
        _orderRepo = orderRepo;
    }
}

// Program.cs
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
// Can easily switch to MongoOrderRepository without changing OrderService
```

---

## 🧪 Testing Strategy

### **1. Unit Tests (80% Coverage Target)**

```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepoMock;
    private readonly Mock<IPaymentService> _paymentServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly OrderService _sut; // System Under Test
    
    public OrderServiceTests()
    {
        _orderRepoMock = new Mock<IOrderRepository>();
        _paymentServiceMock = new Mock<IPaymentService>();
        _mapperMock = new Mock<IMapper>();
        _sut = new OrderService(_orderRepoMock.Object, _paymentServiceMock.Object, _mapperMock.Object);
    }
    
    [Fact]
    public async Task CreateOrder_ValidRequest_ReturnsOrderResponse()
    {
        // Arrange
        var request = new CreateOrderRequest { /* test data */ };
        var expectedOrder = new Order { Id = 1, OrderNumber = "ORD-001" };
        _orderRepoMock.Setup(x => x.CreateAsync(It.IsAny<Order>())).ReturnsAsync(expectedOrder);
        
        // Act
        var result = await _sut.CreateOrderAsync("buyer-001", request);
        
        // Assert
        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("ORD-001");
        _orderRepoMock.Verify(x => x.CreateAsync(It.IsAny<Order>()), Times.Once);
    }
    
    [Fact]
    public async Task CreateOrder_InvalidBuyer_ThrowsException()
    {
        // Arrange
        var request = new CreateOrderRequest();
        
        // Act & Assert
        await Assert.ThrowsAsync<BuyerNotFoundException>(() => _sut.CreateOrderAsync("invalid-id", request));
    }
}
```

### **2. Integration Tests**

```csharp
public class OrdersControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    
    public OrdersControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task CreateOrder_ReturnsCreatedOrder()
    {
        // Arrange
        var request = new CreateOrderRequest { /* test data */ };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        order.Should().NotBeNull();
    }
}
```

### **3. Regression Tests**

```csharp
// Test that existing functionality still works after refactoring
public class OrderFlowRegressionTests
{
    [Fact]
    public async Task CompleteOrderFlow_EndToEnd()
    {
        // 1. Create order
        var order = await _orderService.CreateOrderAsync(request);
        
        // 2. Process payment
        var payment = await _paymentService.InitiatePaymentAsync(order.Id, order.TotalAmount);
        await _paymentService.CapturePaymentAsync(payment.TransactionId);
        
        // 3. Assign transporter
        await _orderService.AssignTransporterAsync(order.Id, "transporter-001");
        
        // 4. Complete delivery
        await _orderService.MarkDeliveredAsync(order.Id);
        
        // 5. Release escrow
        var released = await _paymentService.ReleaseEscrowAsync(order.Id);
        
        // Assert entire flow completed successfully
        released.Should().BeTrue();
    }
}
```

---

## 📊 Success Metrics

- [ ] **Code Coverage:** 80%+ (unit tests)
- [ ] **Integration Tests:** All API endpoints covered
- [ ] **Build Time:** < 30 seconds
- [ ] **Test Execution:** < 5 seconds (unit), < 30 seconds (integration)
- [ ] **SOLID Compliance:** All services follow SOLID principles
- [ ] **No Code Smells:** SonarQube/Resharper analysis passes
- [ ] **Documentation:** XML comments on all public methods

---

## 🚀 Implementation Order (Next Steps)

1. **Install NuGet packages** (AutoMapper, FluentValidation, xUnit, Moq)
2. **Create Repository layer** (IRepository, BaseRepository, specific repos)
3. **Setup AutoMapper** (Create profiles for all entities)
4. **Refactor OrderService** (Use repository, remove DbContext)
5. **Create OrderBuilder** (Complex order construction)
6. **Add PaymentGateway abstraction** (IPaymentGateway, implementations)
7. **Write unit tests** (80% coverage target)
8. **Write integration tests** (All API endpoints)
9. **Add global exception handling** (Middleware)
10. **Run regression tests** (Ensure nothing broke)

---

**Estimated Time:** 5-7 days for complete refactoring + testing
**Priority:** High - This improves maintainability, testability, and scalability

Ready to start implementation? 🎯
