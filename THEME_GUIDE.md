# Theme System - Architecture Guide

## 🎨 Why Theme-Based?

### ❌ Old Approach (Component-heavy SCSS)
- **779 lines** in marketplace.page.scss
- **500+ lines** in cart.page.scss  
- Duplicate styles across components
- Hard to maintain consistency
- Difficult to implement dark mode
- Changes require editing multiple files

### ✅ New Approach (Theme-based)
- **~40 lines** per component SCSS
- Reusable utility classes
- Single source of truth for design tokens
- Easy theme switching (light/dark)
- Changes in one place affect entire app

---

## 📁 File Structure

```
src/theme/
├── tokens.scss       # Design tokens (colors, spacing, typography)
├── utilities.scss    # Utility classes (.flex, .text-lg, .badge, etc.)
├── components.scss   # Complex patterns (.vendor-card, .price-ticker)
└── theme.scss        # Main file that imports all above
```

---

## 🚀 How to Use

### 1. In HTML - Use Utility Classes

**Before (Component-specific CSS):**
```html
<div class="product-header">
  <h2 class="product-name">Tomatoes</h2>
  <span class="product-price">₹45</span>
</div>
```

```scss
// marketplace.page.scss (79 lines just for this)
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}
```

**After (Utility classes):**
```html
<div class="card flex flex-between">
  <h2 class="text-xl text-bold">Tomatoes</h2>
  <span class="product-price-amount">₹45</span>
</div>
```

```scss
// marketplace.page.scss (0 lines - all from utilities!)
```

---

### 2. Common Patterns

#### **Price Display**
```html
<div class="product-price">
  <span class="product-price-amount">₹45</span>
  <span class="product-price-unit">/kg</span>
</div>
```

#### **Status Badge**
```html
<span class="badge badge-success">Available</span>
<span class="badge badge-warning">Low Stock</span>
<span class="badge badge-danger">Out of Stock</span>
```

#### **Price Ticker**
```html
<span class="price-ticker price-ticker-up">+5%</span>
<span class="price-ticker price-ticker-down">-3%</span>
```

#### **Vendor Card**
```html
<div class="vendor-card">
  <div class="vendor-card-header">
    <span class="vendor-card-title">Farm Fresh</span>
    <span class="badge badge-success">Best Price</span>
  </div>
  <div class="vendor-card-price">₹42/kg</div>
</div>
```

#### **Empty State**
```html
<div class="empty-state">
  <div class="empty-state-icon">🛒</div>
  <h3 class="empty-state-title">Cart is Empty</h3>
  <p class="empty-state-description">Add items to get started</p>
  <button class="btn btn-primary">Browse Products</button>
</div>
```

---

## 🎨 Design Tokens Reference

### Colors
```scss
--brand-primary: #10b981 (Green)
--brand-secondary: #f59e0b (Amber)
--brand-accent: #3b82f6 (Blue)

--color-success: Green
--color-warning: Amber  
--color-danger: Red
--color-info: Blue
```

### Spacing
```scss
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
```

### Typography
```scss
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
```

---

## 🔧 Making Changes

### Change Brand Color (Affects Entire App)
```scss
// theme/tokens.scss
:root {
  --brand-primary: #10b981; // Change this one line
}
```
✅ Updates buttons, badges, prices, highlights everywhere

### Add Dark Mode
```scss
// theme/tokens.scss
[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}
```

### Create New Utility
```scss
// theme/utilities.scss
.shadow {
  &-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
  &-none { box-shadow: none; }
}
```

---

## 📊 Benefits

### Performance
- **Smaller CSS bundles** (no duplicate styles)
- **Faster compilation** (less SCSS processing)
- **Better caching** (utilities shared across pages)

### Maintainability
- **One place to change colors** → affects entire app
- **Consistent spacing** across all components
- **Easy to onboard new developers** (just use utility classes)

### Scalability
- **Add new pages** without writing CSS
- **Dark mode** in 20 lines
- **Rebrand** by changing tokens.scss

---

## 🎯 Component SCSS Guidelines

**Only write component SCSS for:**
1. **Layout-specific** (grid columns, positioning)
2. **Animation-specific** (complex keyframes)
3. **Component-unique** (nothing else looks like this)

**Don't write component SCSS for:**
1. Colors → use `--brand-primary`
2. Spacing → use `.p-md`, `.m-lg`
3. Typography → use `.text-lg`, `.text-bold`
4. Flex → use `.flex`, `.flex-between`
5. Badges → use `.badge-success`

---

## 📈 Migration Path

### Phase 1: New Features
✅ Use utility classes for all new components

### Phase 2: Refactor High-Traffic
- Marketplace page
- Cart page
- Order page

### Phase 3: Complete Migration
- Profile
- Vendor pages
- Transporter pages

---

## 🤝 Team Benefits

### Designers
- Design tokens match Figma variables
- Easy to prototype in browser
- Consistent spacing system

### Developers
- Copy-paste utility classes
- No CSS conflicts
- Fast development

### Product
- Rebrand in minutes, not days
- A/B test colors easily
- Consistent UX

---

## 📝 Example: Full Component

**Before (200+ lines of SCSS):**
```scss
.product-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  .header { ... }
  .title { ... }
  .price { ... }
  .badge { ... }
  // 150 more lines...
}
```

**After (10 lines of SCSS, rest in HTML):**
```scss
.product-card {
  @extend .card; // Get all base styles
  
  // Only page-specific layout
  display: grid;
  grid-template-columns: 1fr 2fr;
}
```

```html
<div class="product-card">
  <div class="product-emoji-lg">🍅</div>
  <div class="flex flex-col flex-gap-sm">
    <h3 class="text-xl text-bold">Tomatoes</h3>
    <div class="product-price">
      <span class="product-price-amount">₹45</span>
      <span class="product-price-unit">/kg</span>
    </div>
    <div class="flex flex-gap-sm">
      <span class="badge badge-success">Available</span>
      <span class="price-ticker price-ticker-up">+5%</span>
    </div>
  </div>
</div>
```

---

## 🎓 Learning Resources

### Reference Similar Systems
- **Tailwind CSS** - Utility-first CSS framework
- **Bootstrap** - Component + utility classes
- **Material Design** - Design token system
- **Figma Variables** - Design tokens in Figma

### Key Concepts
1. **Utility Classes** - Single-purpose classes (.text-lg, .flex)
2. **Design Tokens** - Variables for consistency
3. **Component Patterns** - Complex reusable components
4. **Theme Switching** - Light/dark mode support

---

## ✅ Quick Wins

**Immediate Benefits:**
- ✅ 90% less component SCSS
- ✅ Consistent spacing/colors
- ✅ Faster development
- ✅ Easier maintenance
- ✅ Better performance

**Future Benefits:**
- 🎨 Dark mode ready
- 🔄 Easy rebranding
- 📱 Responsive utilities
- ♿ Accessibility helpers
- 🌍 RTL support ready
