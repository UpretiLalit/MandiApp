# Vendor Post-Login System Flow

## 1. Morning Setup (Stock & Price)
- **Goal:** Open the shop for business.
- **Action:** Vendor sees a list of their assigned products.
- **UI Logic:** - Toggle Switch: `In-Stock` (Green) / `Out-of-Stock` (Red).
    - Price Adjuster: Large `+` and `-` buttons (increments of ₹1 or ₹5). No typing allowed.
    - Status: Prices are broadcasted via SignalR to all Buyers in the Mandi.

## 2. Order Management (Reactive Phase)
- **Trigger:** System receives a `ParentOrder` from a Buyer.
- **Notification:** App plays a "Loud Bell" sound and shows a Full-Screen Alert.
- **Action 1 (Accept):** Vendor taps a large Green button: "Start Packing."
- **Action 2 (Pack):** A checklist of items is displayed. Vendor taps each item as they bag it.
- **Action 3 (Ready):** Vendor taps "Bags Ready." 

## 3. Pickup (The Handover)
- **Condition:** Wait for the Transporter to arrive.
- **Action:** Vendor taps "Generate Pickup QR."
- **Verification:** Transporter scans the QR. 
- **System Change:** `OrderItem.Status` becomes `PickedUp`. `Wallet.PendingBalance` updates.

## 4. Closing the Day
- **Summary:** View "Today's Total Sales" and "Total Weight Sold."
- **Payout:** Show the amount scheduled for transfer to the bank at midnight.

## Product Listing Rules
1. **Grading Required:** Every listing MUST have a Grade (A, B, or C).
2. **Bulk Only:** Vendors do not sell in individual Kgs. They sell in "Units" (Crate/Bag).
3. **Price Logic:** Price is always per Unit (e.g., ₹800 per 20kg Crate), not per Kg.
4. **Buyer Interface:** Show "Price per Kg" as a small label for comparison, but the "Add to Cart" button must add the full "Unit."