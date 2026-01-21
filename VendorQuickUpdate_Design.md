# Vendor Quick Update - UI/UX Design

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Quick Update                                    🔄       │  HEADER
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📦 Products     ✅ Active      📈 Quick                    │  STATS CARD
│     10               8          Updates                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🍅  Tomatoes                                    [ON/OFF]   │  PRODUCT CARD
│      Vegetables  Grade A                                    │
│                                                              │
│  [-10%]  [-5%]  [+5%]  [+10%]    ← Quick Actions          │
│                                                              │
│  💰 Price Update                                            │
│  ┌───────────┐   →   ┌───────────┐                        │
│  │ Current   │       │    New    │                         │
│  │  ₹800     │   →   │   ₹880    │  +10%                  │
│  └───────────┘       └───────────┘                         │
│  ₹400 ━━━━━━━●━━━━ ₹1200          ← Price Slider          │
│                                                              │
│  📦 Stock Update                                            │
│  ┌───────────┐   →   ┌───────────┐                        │
│  │ Available │       │    New    │                         │
│  │  25 Peti  │   →   │  30 Peti  │  +5                    │
│  └───────────┘       └───────────┘                         │
│  0 ━━━━━━━━●━━ 1000               ← Stock Slider          │
│                                                              │
│  🎯 Smart Bulk Pricing             ← Gradient Purple Card  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ 1-10     │ │ 11-50    │ │  51+     │                   │
│  │ ₹880     │ │ ₹836     │ │  ₹792    │                   │
│  │  Peti    │ │  Peti    │ │  Peti    │                   │
│  │          │ │  5% OFF  │ │ 10% OFF  │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                              │
│  [        ⚡ Quick Update        ]  ← Update Button        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🧅  Onions                                      [ON/OFF]   │  NEXT PRODUCT
│      Vegetables  Grade A                                    │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Toolbar
```
┌─────────────────────────────────────┐
│ ← Quick Update           🔄         │
└─────────────────────────────────────┘
```
- Back button (left)
- Title: "Quick Update"
- Refresh button (right)
- Color: Primary blue

### 2. Stats Card
```
┌─────────────────────────────────────┐
│  📦 10      ✅ 8       📈 Quick     │
│  Products   Active    Updates       │
└─────────────────────────────────────┘
```
- 3-column grid
- Icon + number + label
- Light background card

### 3. Product Card Header
```
┌─────────────────────────────────────┐
│  🍅  Tomatoes              [●OFF]  │
│      [Vegetables] [Grade A]         │
└─────────────────────────────────────┘
```
- Large emoji (40px)
- Product name (18px bold)
- Category badge (green for Vegetables)
- Grade badge (color-coded)
- Active/Inactive toggle (right)

### 4. Quick Action Buttons
```
┌─────────────────────────────────────┐
│  [-10%]  [-5%]  [+5%]  [+10%]      │
└─────────────────────────────────────┘
```
- 4 small outline buttons
- Centered layout
- Icon + percentage
- Instant price adjustment

### 5. Price/Stock Display
```
┌───────────┐   →   ┌───────────┐
│  Current  │       │    New    │
│   ₹800    │   →   │   ₹880   +10%│
└───────────┘       └───────────┘
```
- Two boxes (current vs new)
- Arrow icon between
- Change badge (green/red)
- Light gray background
- Rounded corners

### 6. Range Sliders
```
₹400 ━━━━━━━●━━━━ ₹1200
     [●●●●●●●─────]
```
- Pin shows current value
- Labels on both ends
- Custom styling (6px height)
- Blue active color
- Smooth dragging

### 7. Bulk Pricing Tiers
```
┌──────────────────────────────────────┐
│  🎯 Smart Bulk Pricing               │
│  ╔═══════╗ ╔═══════╗ ╔═══════╗     │
│  ║ 1-10  ║ ║11-50  ║ ║ 51+   ║     │
│  ║ ₹880  ║ ║ ₹836  ║ ║ ₹792  ║     │
│  ║ Peti  ║ ║ 5% OFF║ ║10% OFF║     │
│  ╚═══════╝ ╚═══════╝ ╚═══════╝     │
└──────────────────────────────────────┘
```
- Purple gradient background (667eea → 764ba2)
- White text
- Glass-morphism effect on tiers
- Auto-fit grid (3 columns)
- Discount badges

### 8. Update Button
```
┌─────────────────────────────────────┐
│      ⚡ Quick Update                │
└─────────────────────────────────────┘
```
- Full width
- Success green color
- Large size (14px padding)
- Lightning icon
- Disabled when no changes

## Color Palette

### Primary Colors
```scss
Primary:   #3880ff  (Blue)
Success:   #2dd36f  (Green)
Warning:   #ffc409  (Yellow/Orange)
Danger:    #eb445a  (Red)
Medium:    #92949c  (Gray)
Light:     #f4f5f8  (Light Gray)
Dark:      #222428  (Dark Gray)
```

### Grade Colors
```scss
Grade A:   success  (Green)
Grade B:   warning  (Orange)
Grade C:   danger   (Red)
```

### Bulk Pricing Gradient
```scss
Start:  #667eea  (Purple)
End:    #764ba2  (Dark Purple)
```

## Typography

### Headings
```
h2: 18px, 600 weight (Product name)
h3: 14px, 600 weight (Section titles)
```

### Body Text
```
Normal:  14px (Product details)
Small:   12px (Labels, meta info)
Strong:  24px, 700 weight (Prices)
```

### Badges
```
Font: 11px
Padding: 2px 8px
Border-radius: 12px
```

## Spacing

### Margins
```
Card margin-bottom: 20px
Section margin-bottom: 24px
Element gaps: 8px, 12px, 16px
```

### Padding
```
Card content: 16px
Update button: 14px vertical
```

## Icons

### Used Icons (Ionicons)
```
cube-outline           → Products
checkmark-circle       → Active
trending-up            → Updates
refresh-outline        → Reload
remove-outline         → Decrease
add-outline            → Increase
arrow-forward          → Direction
flash-outline          → Quick Update
ribbon-outline         → Grade
```

### Emoji Icons
```
🍅 Tomatoes
🧅 Onions
🥔 Potatoes
🥦 Cauliflower
🥬 Cabbage
🥕 Carrots
🍌 Bananas
🌾 Rice/Wheat
🫘 Pulses
🌶️ Chili
```

## Responsive Behavior

### Desktop (>768px)
- Max-width: 800px
- Centered content
- 3-column stats grid
- 3-column bulk pricing

### Mobile (<768px)
- Full width
- Same 3-column stats (fits)
- Bulk pricing auto-adjusts
- Touch-friendly sliders

## Interactions

### Hover States
```
Buttons: Slightly darker
Cards: Subtle shadow
Sliders: Larger knob
```

### Active States
```
Toggle ON: Green color
Toggle OFF: Gray color
Selected: Primary blue
```

### Disabled States
```
Button: Grayed out, no pointer
Opacity: 0.5
Cursor: not-allowed
```

## Animations

### Transitions
```scss
All: 200ms ease
Hover: 150ms
Toggle: 300ms
```

### Loading
```
Spinner with "Loading products..."
Backdrop blur
```

### Toast Messages
```
Success: Green toast (3s)
Error: Red toast (3s)
Info: Blue toast (2s)
```

## Accessibility

### ARIA Labels
- Buttons have clear text
- Icons have names
- Ranges have labels

### Keyboard Navigation
- Tab through all controls
- Enter to activate buttons
- Arrow keys for sliders

### Color Contrast
- All text meets WCAG AA
- Badges readable on backgrounds
- Focus indicators visible

## Performance

### Optimizations
- Lazy loading cards
- Debounced slider events
- Efficient change detection
- Map-based state management

### Bundle Size
- Ionicons tree-shaken
- Only used components loaded
- SCSS compiled to CSS

---

**Design System:** Ionic Design System
**Icons:** Ionicons 7.x
**Fonts:** System fonts (SF Pro, Roboto)
**Framework:** Angular + Ionic
