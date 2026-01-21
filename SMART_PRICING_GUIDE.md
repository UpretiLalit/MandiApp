# Smart Pricing - Flexible Tier System

## Overview
Vendors can set multiple price points based on quantity thresholds. This allows flexible bulk discounts that the vendor controls completely.

## How It Works

### For Vendors:
1. **Toggle Smart Pricing** - Enable/disable bulk pricing per product
2. **Add Price Tiers** - Click "Add Tier" to create new pricing levels
3. **Set Quantities** - Define minimum quantity for each tier (e.g., 10, 15, 20)
4. **Set Prices** - Set the price for each quantity threshold
5. **Auto-Save** - Changes save automatically on blur

### Example Pricing Structure:
- Base price: ₹800 (for 1-9 units)
- Buy 10+ units: ₹760
- Buy 15+ units: ₹720  
- Buy 20+ units: ₹680

### Features:
- **Unlimited Tiers** - Add as many pricing levels as needed
- **Remove Tiers** - Delete unwanted tiers with trash button
- **Auto-Sort** - Tiers automatically sort by minimum quantity
- **Visual Preview** - See how customers will view pricing
- **Per-Product Control** - Each product can have different tier structures

## Backend API

### GET /api/products/vendor-inventory
Returns products with pricing tiers:
```json
{
  "id": 1,
  "name": "Tomatoes",
  "currentPrice": 800,
  "hasSmartPricing": true,
  "pricingTiers": [
    { "minQuantity": 10, "price": 760 },
    { "minQuantity": 15, "price": 720 },
    { "minQuantity": 20, "price": 680 }
  ]
}
```

### PUT /api/products/{id}
Update product with pricing tiers:
```json
{
  "price": 800,
  "stockQuantity": 25,
  "isActive": true,
  "hasSmartPricing": true,
  "pricingTiers": [
    { "minQuantity": 10, "price": 760 },
    { "minQuantity": 15, "price": 720 }
  ]
}
```

## Frontend Implementation

### Data Model:
```typescript
interface PricingTier {
  minQuantity: number;
  price: number;
}
```

### Key Methods:
- `addTier(product)` - Add new tier with smart defaults
- `removeTier(product, index)` - Remove tier by index
- `onTierChange(product)` - Validate and sort tiers
- `getFirstTierMin(product)` - Get first tier's min quantity for preview

### UI Components:
1. **Tier Header** - Title + "Add Tier" button
2. **Base Price Row** - Shows regular price
3. **Tier List** - Dynamic list of editable tiers
4. **Tier Item** - Quantity input + price input + remove button
5. **Preview** - Shows customer-facing tier display

## User Experience

### Vendor Flow:
1. Login as Vendor
2. Navigate to Quick Update page
3. Find product
4. Toggle "Smart Bulk Pricing" ON
5. Click "Add Tier"
6. Set "Buy 10+ units" → "₹760"
7. Click "Add Tier" again
8. Set "Buy 15+ units" → "₹720"
9. Changes auto-save

### Customer Flow:
1. Browse marketplace
2. See product with tiered pricing
3. Pricing display shows:
   - 1-9 units: ₹800 each
   - 10+ units: ₹760 each
   - 15+ units: ₹720 each
4. Add quantity to cart
5. Price automatically adjusts based on quantity

## Benefits
- **Flexibility** - Vendor sets exact thresholds and prices
- **Simplicity** - Direct prices, not percentages
- **Transparency** - Customer sees all pricing tiers upfront
- **Control** - Optional per product, unlimited tiers
- **Revenue** - Encourages bulk purchases

## Files Modified
- `ProductsController.cs` - Backend API with pricingTiers
- `quick-update.page.html` - Tier management UI
- `quick-update.page.ts` - Tier logic and validation
- `quick-update.page.scss` - Tier styling
