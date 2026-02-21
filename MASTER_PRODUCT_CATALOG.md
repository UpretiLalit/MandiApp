# Master Product Catalog System

## Overview
The system now includes a comprehensive master catalog of **90+ products** including:
- **25 Vegetables** (leafy, root, gourd family, etc.)
- **27 Fruits** (citrus, tropical, berries, stone fruits)
- **28 Grains & Pulses** (rice, wheat, dals, cereals)

Each product includes:
- English and Hindi names
- Category and subcategory
- Detailed description
- Multiple high-quality images (2-3 per product)
- Default unit (kg, dozen, piece)

## How It Works

### 1. Master Product Catalog
- **Read-only** product library with all vegetables, fruits, and grains
- Includes product details, images, and descriptions
- Managed centrally (can be updated by admins)

### 2. Vendor Inventory
- Vendors **browse the master catalog**
- Select products they want to sell
- Add to their inventory with:
  - **Price** (their selling price)
  - **Stock** (available quantity)
  - **IsLive** status (published or draft)

### 3. Live Status Control
- **Vendor controls**: Each vendor decides if their product is live (visible to buyers)
- **Admin controls**: (future) Admins can moderate/suspend products
- Products are only visible to buyers when `IsLive = true`

## Database Setup

### Run the seed script:
```bash
# Connect to your Supabase database
# Go to: https://app.supabase.com → SQL Editor
# Copy and paste: seed-master-products.sql
# Click "Run"
```

This will:
1. Create `MasterProducts` table
2. Seed 90+ products with images
3. Add `MasterProductId` and `IsLive` columns to Products table
4. Create indexes for performance
5. Create view for live vendor products

## API Endpoints

### For All Users (Browse Catalog)

#### Get all master products
```http
GET /api/masterproducts
GET /api/masterproducts?category=Vegetable
GET /api/masterproducts?search=tomato
```

Response:
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Tomato",
      "nameHindi": "टमाटर",
      "category": "Vegetable",
      "subCategory": "Fruit Vegetable",
      "description": "Red juicy vegetable, essential for curries",
      "unit": "kg",
      "imageUrls": [
        "https://images.unsplash.com/photo-1546470427-e26264be0b0d",
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea"
      ]
    }
  ],
  "count": 25
}
```

#### Get products by category
```http
GET /api/masterproducts/category/Vegetable
GET /api/masterproducts/category/Fruit
GET /api/masterproducts/category/Grain
```

#### Get single product
```http
GET /api/masterproducts/{id}
```

#### Get categories with counts
```http
GET /api/masterproducts/categories
```

Response:
```json
{
  "categories": [
    {
      "category": "Vegetable",
      "count": 25,
      "subCategories": ["Leafy", "Root", "Gourd", "Cruciferous"]
    },
    {
      "category": "Fruit",
      "count": 27,
      "subCategories": ["Citrus", "Tropical", "Berry", "Stone Fruit"]
    }
  ]
}
```

### For Vendors (Manage Inventory)

#### Add master product to inventory
```http
POST /api/masterproducts/add-to-inventory
Authorization: Bearer {vendor-token}
Content-Type: application/json

{
  "masterProductId": "uuid",
  "price": 45.00,
  "stock": 100,
  "isLive": false  // draft mode
}
```

Response:
```json
{
  "message": "Product added to inventory successfully",
  "productId": 123,
  "product": { ... }
}
```

#### Toggle product live status
```http
PATCH /api/masterproducts/{productId}/toggle-live
Authorization: Bearer {vendor-token}
```

Toggles between published/unpublished.

Response:
```json
{
  "message": "Product published successfully",
  "isLive": true
}
```

## Frontend Integration

### 1. Browse Master Catalog (Vendor)
```typescript
// Fetch all vegetables
const response = await axios.get('/api/masterproducts?category=Vegetable');
const vegetables = response.data.products;

// Display in a grid with images
vegetables.forEach(product => {
  // Show product.imageUrls[0] as thumbnail
  // Show product.name and product.nameHindi
  // "Add to Inventory" button
});
```

### 2. Add to Inventory
```typescript
async addToInventory(masterProductId: string) {
  const data = {
    masterProductId,
    price: this.priceForm.value,
    stock: this.stockForm.value,
    isLive: false  // Save as draft first
  };
  
  await this.http.post('/api/masterproducts/add-to-inventory', data);
  // Show success message
  // Navigate to inventory list
}
```

### 3. Manage Live Status
```typescript
async toggleLive(productId: number) {
  await this.http.patch(`/api/masterproducts/${productId}/toggle-live`, {});
  // Product is now live/unpublished
  this.loadInventory();  // Refresh list
}
```

### 4. Show Live Products to Buyers
```typescript
// In marketplace/products list
// Backend should filter: WHERE IsLive = true

async getMarketplaceProducts(category?: string) {
  const url = category 
    ? `/api/products?category=${category}&isLive=true`
    : '/api/products?isLive=true';
    
  const response = await axios.get(url);
  return response.data.products;
}
```

## Product Categories

### Vegetables (25 products)
- **Leafy**: Spinach, Cabbage, Lettuce, Coriander, Fenugreek
- **Root**: Potato, Onion, Garlic, Ginger, Carrot, Radish, Beetroot, Turnip
- **Gourd**: Bottle Gourd, Ridge Gourd, Bitter Gourd, Pumpkin, Cucumber
- **Others**: Cauliflower, Broccoli, Green Peas, Green Beans, Eggplant, Bell Pepper, Green Chili, Lady Finger, Mushroom, Sweet Corn, Tomato

### Fruits (27 products)
- **Citrus**: Orange, Lemon, Sweet Lime
- **Tropical**: Mango, Banana, Papaya, Pineapple, Coconut, Guava
- **Berries**: Strawberry, Grapes, Pomegranate
- **Others**: Apple, Watermelon, Muskmelon, Peach, Plum, Cherry, Pear, Kiwi, Dragon Fruit, Litchi, Custard Apple, Fig, Dates

### Grains & Pulses (28 products)
- **Rice**: Basmati, White, Brown, Sona Masoori
- **Wheat**: Whole Wheat, Wheat Flour, Maida, Semolina
- **Pulses**: Toor Dal, Moong Dal, Masoor Dal, Chana Dal, Urad Dal, Whole Moong, Rajma, Kabuli Chana, Black Chana
- **Others**: Barley, Oats, Quinoa, Millets, Cornmeal

## Image Sources
All images are from Unsplash (free, high-quality):
- Real product photography
- Professional lighting and composition
- Multiple angles/presentations per product
- Optimized for web/mobile display

## Benefits

### For Vendors
✅ No need to manually enter product details
✅ Professional product images included
✅ Consistent product naming and categories
✅ Control over what's visible (IsLive status)
✅ Focus on pricing and inventory management

### For Buyers
✅ Standardized product information
✅ High-quality product images
✅ Consistent shopping experience
✅ Easy to compare vendors
✅ Only see products that are in stock

### For Admins
✅ Centralized product catalog management
✅ Add new products to entire platform at once
✅ Update images/descriptions globally
✅ Monitor what vendors are selling
✅ Quality control and moderation

## Future Enhancements

1. **Admin Product Management**
   - Add/edit/delete master products
   - Bulk import from CSV
   - Product approval workflow

2. **Product Variations**
   - Size variants (small, medium, large)
   - Grade variants (A, B, C)
   - Organic/conventional flags

3. **Smart Suggestions**
   - Recommend products based on location
   - Seasonal product highlighting
   - Popular products in category

4. **Product Analytics**
   - Most viewed products
   - Conversion rates by product
   - Vendor competition analysis

## Usage Example

```bash
# 1. Run seed script in Supabase SQL Editor
# (seed-master-products.sql)

# 2. Deploy backend with new changes
git add .
git commit -m "Add master product catalog system"
git push origin master

# 3. In vendor app:
# - Browse master products
# - Click "Add to Inventory"
# - Set price and stock
# - Save as draft (IsLive = false)
# - Review and publish (IsLive = true)

# 4. In buyer app:
# - See only live products
# - Filter by category
# - View product images
# - Place orders
```

## Notes

- Products with `IsLive = false` are **not visible** to buyers
- Vendors can unpublish products anytime (out of stock, pricing changes)
- Master catalog is **shared** - all vendors can add same products
- Each vendor's product has **independent pricing and stock**
- Images are hosted on Unsplash CDN (fast and reliable)
