# B2B Mandi App - UX & Journey Logic

## Design Principles
1. **Low Literacy Friendly:** Use icons and colors over heavy text.
2. **Minimal Input:** Use sliders for prices and QR codes for handovers.
3. **One-Way Flow:** Each screen should have only one "Next" action.

## User Journey Definitions
### [Buyer]
- Start -> Daily Price List -> Quick Add -> Multi-vendor Checkout -> Pay.
### [Vendor]
- Start -> Active Stock Toggle -> Price Slider -> Generate Pickup QR.
### [Transporter]
- Start -> Map Pins (Mandi) -> Scan Vendor QR -> Delivery Map -> Scan Buyer QR.

## Copilot Guidelines
- When generating Angular Components, prioritize "Card-based" layouts.
- Use SignalR to trigger "Order Received" sounds on the Vendor mobile app.
- Ensure the "Price Update" API is optimized for 1-click execution.