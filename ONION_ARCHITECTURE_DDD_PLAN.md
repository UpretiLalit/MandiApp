# 🧅 Onion Architecture + DDD Implementation Plan

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│           (API, Controllers, SignalR Hubs)                   │
│                Ordering.API (Web Project)                    │
└─────────────────────────────────────────────────────────────┘
                          │ depends on
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│        (EF Core, Repositories, External Services)            │
│              Ordering.Infrastructure                         │
│  - Repositories, DbContext, Payment Gateways, SMS, Email    │
└─────────────────────────────────────────────────────────────┘
                          │ depends on
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│         (Use Cases, DTOs, Application Services)              │
│               Ordering.Application                           │
│  - Commands, Queries, DTOs, Validators, Interfaces          │
└─────────────────────────────────────────────────────────────┘
                          │ depends on
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│              (Business Logic, Entities)                      │
│                 Ordering.Domain                              │
│  - Entities, Value Objects, Aggregates, Domain Events       │
│  - NO DEPENDENCIES (Pure Business Logic)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
MandiApp/Backend/Services/Ordering/
├── Ordering.Domain/              (Class Library - .NET 8)
│   ├── Aggregates/
│   │   ├── OrderAggregate/
│   │   │   ├── Order.cs          (Aggregate Root)
│   │   │   ├── OrderItem.cs      (Entity)
│   │   │   └── OrderStatus.cs    (Enum)
│   │   └── PaymentAggregate/
│   │       ├── Payment.cs        (Aggregate Root)
│   │       └── PaymentStatus.cs
│   ├── ValueObjects/
│   │   ├── Money.cs
│   │   ├── Address.cs
│   │   ├── PhoneNumber.cs
│   │   └── OrderNumber.cs
│   ├── DomainEvents/
│   │   ├── OrderCreatedEvent.cs
│   │   ├── PaymentReceivedEvent.cs
│   │   └── OrderDeliveredEvent.cs
│   ├── DomainServices/
│   │   ├── OrderPricingService.cs
│   │   └── EscrowService.cs
│   ├── Repositories/            (Interfaces only)
│   │   ├── IOrderRepository.cs
│   │   └── IPaymentRepository.cs
│   └── Common/
│       ├── BaseEntity.cs
│       ├── IAggregateRoot.cs
│       └── IDomainEvent.cs
│
├── Ordering.Application/         (Class Library - .NET 8)
│   ├── Commands/
│   │   ├── CreateOrder/
│   │   │   ├── CreateOrderCommand.cs
│   │   │   ├── CreateOrderCommandHandler.cs
│   │   │   └── CreateOrderCommandValidator.cs
│   │   ├── ProcessPayment/
│   │   │   ├── ProcessPaymentCommand.cs
│   │   │   └── ProcessPaymentCommandHandler.cs
│   │   └── MarkOrderDelivered/
│   │       ├── MarkOrderDeliveredCommand.cs
│   │       └── MarkOrderDeliveredCommandHandler.cs
│   ├── Queries/
│   │   ├── GetOrder/
│   │   │   ├── GetOrderQuery.cs
│   │   │   └── GetOrderQueryHandler.cs
│   │   └── GetBuyerOrders/
│   │       ├── GetBuyerOrdersQuery.cs
│   │       └── GetBuyerOrdersQueryHandler.cs
│   ├── DTOs/
│   │   ├── OrderDto.cs
│   │   ├── PaymentDto.cs
│   │   └── OrderItemDto.cs
│   ├── Interfaces/
│   │   ├── IPaymentGateway.cs
│   │   ├── INotificationService.cs
│   │   └── ISmsService.cs
│   ├── Mappers/
│   │   └── MappingProfile.cs
│   └── Behaviors/               (MediatR Pipeline)
│       ├── ValidationBehavior.cs
│       └── LoggingBehavior.cs
│
├── Ordering.Infrastructure/      (Class Library - .NET 8)
│   ├── Persistence/
│   │   ├── OrderingDbContext.cs
│   │   ├── Repositories/
│   │   │   ├── OrderRepository.cs
│   │   │   └── PaymentRepository.cs
│   │   └── Configurations/
│   │       ├── OrderConfiguration.cs
│   │       └── PaymentConfiguration.cs
│   ├── ExternalServices/
│   │   ├── RazorpayGateway.cs
│   │   ├── StripeGateway.cs
│   │   ├── SmsService.cs
│   │   └── EmailService.cs
│   └── DependencyInjection.cs
│
└── Ordering.API/                 (Web API - .NET 8)
    ├── Controllers/
    │   ├── OrdersController.cs   (Thin - delegates to MediatR)
    │   └── PaymentsController.cs
    ├── Hubs/
    │   ├── PriceHub.cs
    │   └── TrackingHub.cs
    ├── Middleware/
    │   └── ExceptionHandlingMiddleware.cs
    └── Program.cs

Tests/
├── Ordering.Domain.Tests/        (xUnit)
│   ├── Aggregates/
│   │   └── OrderAggregateTests.cs
│   └── ValueObjects/
│       └── MoneyTests.cs
├── Ordering.Application.Tests/   (xUnit)
│   ├── Commands/
│   │   └── CreateOrderCommandHandlerTests.cs
│   └── Queries/
│       └── GetOrderQueryHandlerTests.cs
└── Ordering.API.IntegrationTests/ (xUnit)
    └── Controllers/
        └── OrdersControllerTests.cs
```

---

## 🎯 DDD Building Blocks

### 1. **Entities** (Have Identity)
```csharp
// Domain/Aggregates/OrderAggregate/Order.cs
public class Order : BaseEntity, IAggregateRoot
{
    private readonly List<OrderItem> _orderItems = new();
    
    public string OrderNumber { get; private set; }
    public string BuyerId { get; private set; }
    public Money TotalAmount { get; private set; }
    public Address DeliveryAddress { get; private set; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyCollection<OrderItem> OrderItems => _orderItems.AsReadOnly();
    
    // Private constructor for EF
    private Order() { }
    
    // Factory method
    public static Order Create(string buyerId, Address deliveryAddress)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = OrderNumber.Generate(),
            BuyerId = buyerId,
            DeliveryAddress = deliveryAddress,
            Status = OrderStatus.Pending
        };
        
        order.AddDomainEvent(new OrderCreatedEvent(order));
        return order;
    }
    
    public void AddItem(string productId, int quantity, Money unitPrice)
    {
        var item = OrderItem.Create(productId, quantity, unitPrice);
        _orderItems.Add(item);
        RecalculateTotal();
    }
    
    public void MarkAsDelivered()
    {
        if (Status != OrderStatus.InTransit)
            throw new InvalidOperationException("Order must be in transit");
            
        Status = OrderStatus.Delivered;
        AddDomainEvent(new OrderDeliveredEvent(this));
    }
    
    private void RecalculateTotal()
    {
        TotalAmount = _orderItems.Sum(i => i.TotalPrice);
    }
}
```

### 2. **Value Objects** (No Identity)
```csharp
// Domain/ValueObjects/Money.cs
public class Money : ValueObject
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    
    private Money() { }
    
    public Money(decimal amount, string currency = "INR")
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative");
            
        Amount = amount;
        Currency = currency;
    }
    
    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException("Cannot add different currencies");
            
        return new Money(a.Amount + b.Amount, a.Currency);
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}

// Domain/ValueObjects/Address.cs
public class Address : ValueObject
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string State { get; private set; }
    public string Pincode { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    
    private Address() { }
    
    public Address(string street, string city, string state, string pincode, 
                   double latitude, double longitude)
    {
        if (string.IsNullOrWhiteSpace(pincode) || pincode.Length != 6)
            throw new ArgumentException("Invalid pincode");
            
        Street = street;
        City = city;
        State = state;
        Pincode = pincode;
        Latitude = latitude;
        Longitude = longitude;
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return Pincode;
    }
}
```

### 3. **Aggregates** (Cluster of Entities)
```csharp
// Order is the Aggregate Root
// OrderItem is an entity within the aggregate
// All access to OrderItem goes through Order

public class OrderItem : BaseEntity
{
    public string ProductId { get; private set; }
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money TotalPrice { get; private set; }
    
    private OrderItem() { }
    
    internal static OrderItem Create(string productId, int quantity, Money unitPrice)
    {
        return new OrderItem
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Quantity = quantity,
            UnitPrice = unitPrice,
            TotalPrice = new Money(quantity * unitPrice.Amount)
        };
    }
    
    internal void UpdateQuantity(int newQuantity)
    {
        if (newQuantity <= 0)
            throw new ArgumentException("Quantity must be positive");
            
        Quantity = newQuantity;
        TotalPrice = new Money(newQuantity * UnitPrice.Amount);
    }
}
```

### 4. **Domain Events**
```csharp
// Domain/DomainEvents/OrderCreatedEvent.cs
public class OrderCreatedEvent : IDomainEvent
{
    public Guid OrderId { get; }
    public string BuyerId { get; }
    public DateTime OccurredOn { get; }
    
    public OrderCreatedEvent(Order order)
    {
        OrderId = order.Id;
        BuyerId = order.BuyerId;
        OccurredOn = DateTime.UtcNow;
    }
}

// Domain/DomainEvents/PaymentReceivedEvent.cs
public class PaymentReceivedEvent : IDomainEvent
{
    public Guid PaymentId { get; }
    public Guid OrderId { get; }
    public decimal Amount { get; }
    public DateTime OccurredOn { get; }
    
    public PaymentReceivedEvent(Payment payment)
    {
        PaymentId = payment.Id;
        OrderId = payment.OrderId;
        Amount = payment.Amount.Amount;
        OccurredOn = DateTime.UtcNow;
    }
}
```

### 5. **Domain Services** (Complex Business Logic)
```csharp
// Domain/DomainServices/OrderPricingService.cs
public class OrderPricingService
{
    public Money CalculateTotalPrice(Order order, decimal logisticsDistanceKm)
    {
        var produceTotal = order.OrderItems.Sum(i => i.TotalPrice.Amount);
        var logisticsFee = CalculateLogisticsFee(logisticsDistanceKm, produceTotal);
        var serviceFee = CalculateServiceFee(produceTotal);
        var gst = CalculateGST(produceTotal + logisticsFee);
        
        return new Money(produceTotal + logisticsFee + serviceFee + gst);
    }
    
    private decimal CalculateLogisticsFee(decimal distanceKm, decimal orderValue)
    {
        // Complex domain logic
        var baseFee = distanceKm * 5; // ₹5 per km
        var weightFee = orderValue / 1000 * 2; // ₹2 per kg
        return baseFee + weightFee;
    }
    
    private decimal CalculateServiceFee(decimal orderValue)
    {
        return orderValue * 0.05m; // 5% service fee
    }
    
    private decimal CalculateGST(decimal taxableAmount)
    {
        return taxableAmount * 0.05m; // 5% GST
    }
}
```

---

## 🎯 CQRS Pattern (Command Query Responsibility Segregation)

### Commands (Modify State)
```csharp
// Application/Commands/CreateOrder/CreateOrderCommand.cs
public record CreateOrderCommand(
    string BuyerId,
    List<OrderItemDto> Items,
    AddressDto DeliveryAddress
) : IRequest<OrderDto>;

// Application/Commands/CreateOrder/CreateOrderCommandHandler.cs
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderPricingService _pricingService;
    private readonly IMapper _mapper;
    
    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        OrderPricingService pricingService,
        IMapper mapper)
    {
        _orderRepository = orderRepository;
        _pricingService = pricingService;
        _mapper = mapper;
    }
    
    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Create Order aggregate
        var address = new Address(
            request.DeliveryAddress.Street,
            request.DeliveryAddress.City,
            request.DeliveryAddress.State,
            request.DeliveryAddress.Pincode,
            request.DeliveryAddress.Latitude,
            request.DeliveryAddress.Longitude
        );
        
        var order = Order.Create(request.BuyerId, address);
        
        // 2. Add items
        foreach (var item in request.Items)
        {
            var unitPrice = new Money(item.UnitPrice);
            order.AddItem(item.ProductId, item.Quantity, unitPrice);
        }
        
        // 3. Calculate pricing
        var totalPrice = _pricingService.CalculateTotalPrice(order, 10); // TODO: Get actual distance
        
        // 4. Save to repository
        await _orderRepository.AddAsync(order, cancellationToken);
        await _orderRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        
        // 5. Return DTO
        return _mapper.Map<OrderDto>(order);
    }
}

// Application/Commands/CreateOrder/CreateOrderCommandValidator.cs
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.BuyerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleFor(x => x.DeliveryAddress).NotNull();
        RuleForEach(x => x.Items).ChildRules(item => {
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}
```

### Queries (Read Data)
```csharp
// Application/Queries/GetOrder/GetOrderQuery.cs
public record GetOrderQuery(Guid OrderId) : IRequest<OrderDto>;

// Application/Queries/GetOrder/GetOrderQueryHandler.cs
public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;
    
    public GetOrderQueryHandler(IOrderRepository orderRepository, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
    }
    
    public async Task<OrderDto> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        
        if (order == null)
            throw new OrderNotFoundException(request.OrderId);
            
        return _mapper.Map<OrderDto>(order);
    }
}
```

---

## 📋 Implementation Steps

### Step 1: Create Projects (30 minutes)
```bash
cd D:\MandiApp\Backend\Services

# Create solution
dotnet new sln -n Ordering

# Create Domain (Pure, no dependencies)
dotnet new classlib -n Ordering.Domain
dotnet sln add Ordering.Domain/Ordering.Domain.csproj

# Create Application (depends on Domain)
dotnet new classlib -n Ordering.Application
dotnet sln add Ordering.Application/Ordering.Application.csproj
cd Ordering.Application
dotnet add reference ../Ordering.Domain/Ordering.Domain.csproj

# Create Infrastructure (depends on Domain + Application)
cd ..
dotnet new classlib -n Ordering.Infrastructure
dotnet sln add Ordering.Infrastructure/Ordering.Infrastructure.csproj
cd Ordering.Infrastructure
dotnet add reference ../Ordering.Domain/Ordering.Domain.csproj
dotnet add reference ../Ordering.Application/Ordering.Application.csproj

# Update API (depends on Application + Infrastructure)
cd ../Ordering.API
dotnet add reference ../Ordering.Application/Ordering.Application.csproj
dotnet add reference ../Ordering.Infrastructure/Ordering.Infrastructure.csproj
```

### Step 2: Install Packages (10 minutes)
```bash
# Domain - NO PACKAGES (pure business logic)

# Application
cd ../Ordering.Application
dotnet add package MediatR
dotnet add package AutoMapper
dotnet add package FluentValidation

# Infrastructure
cd ../Ordering.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools

# API
cd ../Ordering.API
dotnet add package MediatR.Extensions.Microsoft.DependencyInjection
```

### Step 3: Implement Domain Layer (2-3 hours)
- Create base classes (BaseEntity, ValueObject, IAggregateRoot)
- Implement Order aggregate
- Implement Value Objects (Money, Address, PhoneNumber)
- Create Domain Events
- Add Domain Services

### Step 4: Implement Application Layer (2-3 hours)
- Create Commands and Handlers
- Create Queries and Handlers
- Add Validators
- Create DTOs
- Setup AutoMapper profiles

### Step 5: Implement Infrastructure (2 hours)
- Move DbContext
- Implement Repositories
- Configure EF Core mappings
- Implement external services (Payment, SMS, Email)

### Step 6: Update API Layer (1 hour)
- Thin controllers using MediatR
- Setup DI in Program.cs
- Add middleware

### Step 7: Add Tests (3-4 hours)
- Domain tests
- Application tests
- Integration tests

---

## 🎯 Benefits of This Architecture

✅ **Testability** - Domain layer has zero dependencies  
✅ **Maintainability** - Clear separation of concerns  
✅ **Flexibility** - Easy to swap EF Core for Mongo, Razorpay for Stripe  
✅ **Business Logic Protection** - Domain layer is isolated  
✅ **SOLID Principles** - Inherently follows all SOLID principles  
✅ **DDD Patterns** - Aggregates, Value Objects, Domain Events  
✅ **CQRS** - Separate read and write models  

---

## ⏱️ Timeline

- **Step 1:** Create Projects → 30 min
- **Step 2:** Install Packages → 10 min  
- **Step 3:** Domain Layer → 2-3 hours
- **Step 4:** Application Layer → 2-3 hours
- **Step 5:** Infrastructure → 2 hours
- **Step 6:** API Layer → 1 hour
- **Step 7:** Tests → 3-4 hours

**Total: 11-14 hours (2 days of focused work)**

---

## 🚀 Ready to Start?

This is **enterprise-grade architecture** used by major companies. It's more complex than simple layered architecture but much better for:
- Large teams
- Long-term maintenance
- Complex business logic
- Testability
- Scalability

**Should I start creating the projects now?** (30 minutes to set up the structure)
