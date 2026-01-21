# Admin Portal Documentation

## Login as Admin

### How to Access Admin Portal

1. **Navigate to Login**: Open the app and go to the login page
2. **Select Admin Role**: In the role selector, choose "Admin" (shield icon)
3. **Enter Phone Number**: Use any valid 10-digit number starting with 6-9
4. **Use OTP**: Enter `123456` (development bypass)
5. **Auto-Redirect**: After successful login, you'll be redirected to `/admin/verification`

### Mock Admin Credentials
- **Phone**: Any 10-digit number (e.g., 9876543210)
- **OTP**: `123456`
- **Auto-login as**: System Administrator (admin-001)

---

## Admin Portal Features

### A. KYC Verification Pipeline (International Standard)

**Location**: `/admin/verification` (default admin landing page)

#### Features

**1. Submission Queue**
- Real-time notification system when Vendors/Transporters register
- Visual badge showing pending count: "All (3)", "Vendors (2)", "Transporters (1)"
- Search functionality: Filter by name, phone, email, business name, vehicle number
- Time tracking: Shows "2h ago", "1d ago" for each submission

**2. Document Audit System**

Documents required based on role:

**For Vendors:**
- ✓ Government ID (Aadhaar/PAN)
- ✓ Stall License

**For Transporters:**
- ✓ Government ID (Aadhaar/PAN)
- ✓ Driving License
- ✓ Vehicle Insurance

**Document Preview:**
- Click any document card to view full image
- Shows document number, upload date
- Placeholder images for development (replace with real uploads)

**3. User Information Cards**

Each pending user shows:
- Profile (avatar, name, role badge)
- Contact info (phone, email)
- Role-specific details:
  - **Vendors**: Business name, stall number, mandi location
  - **Transporters**: Vehicle type, number, capacity
- All submitted documents (clickable to preview)
- Registration timestamp

**4. Approval/Rejection Workflow**

**Approval Process:**
1. Click "Approve & Send Welcome SMS" button
2. Confirmation dialog appears
3. On confirmation:
   - User status → `approved`
   - All documents marked as approved
   - Removed from pending queue
   - **Automated SMS sent**: "Welcome to Mandi App! Your account has been approved."
   - **Push notification triggered**
   - Success toast: "✅ [Name] approved! Welcome SMS sent."

**Rejection Process:**
1. Click "Reject Application" button
2. Dialog with reason textarea (optional)
3. On confirmation:
   - User status → `rejected`
   - Removed from pending queue
   - **Automated SMS sent**: "Your Mandi App application was not approved. Reason: [reason]"
   - Warning toast: "❌ [Name]'s application rejected."

**5. Filtering & Search**

**Tab Filters:**
- All: Shows vendors + transporters
- Vendors: Only vendor applications
- Transporters: Only transporter applications

**Search Box:**
- Searches across: name, phone, email, business name, vehicle number
- Debounced (300ms delay)
- Updates results in real-time

**6. Mock Data (Development)**

Currently showing 3 pending users:
- Rajesh Kumar (Vendor - Fresh Farms, Azadpur Mandi)
- Amit Singh (Transporter - Tempo, DL-1234-5678)
- Priya Sharma (Vendor - Organic Veggies, Mumbai APMC)

---

### B. Hub Management (Global Mandi Onboarding)

**Location**: `/admin/hubs`

#### Features

**1. Global Stats Dashboard**
- Total Hubs count
- Active Hubs (with green icon)
- Total Vendors across all hubs
- Total Transporters across all hubs

**2. Hub Cards**
Each hub displays:
- Name + Active/Inactive badge
- Geofencing: Lat/Long coordinates, Radius (km)
- Regional Settings: Timezone, Currency (with symbol), Languages
- Statistics: Vendor count, Transporter count, Daily orders
- Created date
- Action buttons: View, Edit, Delete, Activate/Deactivate

**3. Create New Hub**
Form sections:
- **Basic Information**: Name, Timezone (8 options), Currency (7 with symbols)
- **Geofencing**: 
  - "Use Current Location" button (browser geolocation)
  - Manual lat/long input (6 decimal places)
  - Radius slider (1-50 km)
- **Language Policy**: Primary language, Secondary language (8 options)

**4. Hub Operations**
- View Details: Navigate to hub detail page
- Edit Hub: Pre-populate form with existing data
- Delete Hub: Confirmation dialog before removal
- Toggle Status: Activate/Deactivate with confirmation

**5. International Support**
- **8 Timezones**: Asia/Kolkata, Dubai, New York, Los Angeles, London, Singapore, Hong Kong, Sydney
- **7 Currencies**: INR ₹, USD $, EUR €, GBP £, AED د.إ, SGD S$, AUD A$
- **8 Languages**: English, Hindi, Arabic, Spanish, French, Chinese, Tamil, Telugu

---

## Navigation

### Admin Navigation Tabs (Top Level)
Both pages have consistent navigation:
1. **KYC Verification** (shield icon)
2. **Hub Management** (business icon)

Click any tab to switch between admin sections.

### Menu Button
Both pages include a menu button for accessing other admin features (future expansion).

---

## Technical Implementation

### Frontend Files Created

**Verification Page:**
- `verification.page.ts` - Component logic, mock data, approval/rejection
- `verification.page.html` - UI with tabs, search, user cards, document preview
- `verification.page.scss` - Professional styling with hover effects
- `verification.module.ts` - Module configuration
- `verification-routing.module.ts` - Route configuration

**Hubs Page:** (Already exists)
- `hubs.page.ts` - Hub management logic
- `hubs.page.html` - Dashboard with stats, cards, create form
- `hubs.page.scss` - Admin dashboard styling

**Login Page:** (Updated)
- Added "Admin" role to segment selector
- Added Admin mock user data
- Auto-redirect to `/admin/verification` for admin role

**Admin Routing:** (Updated)
- Default route redirects to `verification`
- Routes: `verification`, `hubs`

### Mock Data Toggle

Both pages have `useMockData: boolean = true` flag:
- **Development**: Uses local mock data, simulates SMS/notifications
- **Production**: Set to `false`, calls real backend API

### Notification System

**SMS Notifications** (simulated in console):
- Approval: "Welcome to Mandi App! Your account has been approved."
- Rejection: "Your Mandi App application was not approved. Reason: [reason]"

**Push Notifications** (TODO):
- Firebase Cloud Messaging integration pending
- Will send same messages via push

**In-App Toasts**:
- Success (green): Approval confirmation
- Warning (orange): Rejection confirmation
- Info (blue): General notifications

---

## Development vs Production

### Current State (Development)
- ✅ Mock authentication (OTP: 123456)
- ✅ Mock pending users (3 sample applications)
- ✅ Mock hubs (Azadpur, Mumbai APMC)
- ✅ Console log SMS notifications
- ✅ Local state management

### Production Setup (TODO)

**Backend APIs Needed:**

```typescript
// Verification Service
GET  /api/admin/pending-users       // Get all pending verifications
POST /api/admin/approve-user/:id    // Approve user, trigger SMS
POST /api/admin/reject-user/:id     // Reject user, send reason
GET  /api/admin/document/:id        // Get document image

// Hub Service
GET    /api/admin/hubs              // Get all hubs
POST   /api/admin/hubs              // Create new hub
PUT    /api/admin/hubs/:id          // Update hub
DELETE /api/admin/hubs/:id          // Delete hub
PATCH  /api/admin/hubs/:id/status   // Toggle active status

// SMS Service
POST /api/notifications/sms         // Send SMS via Twilio/AWS SNS
POST /api/notifications/push        // Send push notification
```

**Services to Create:**
- `VerificationService` - API calls for KYC operations
- `HubService` - API calls for hub management
- `NotificationService` - SMS/Push notification handling

**Document Upload:**
- S3/Azure Blob Storage for document images
- Signed URLs for secure document preview
- Image optimization and compression

**Real-time Notifications:**
- WebSocket connection for live updates
- Or polling every 30 seconds
- Badge count updates on new submissions

---

## User Flow

### Vendor/Transporter Registration Flow
1. User registers via mobile app
2. Uploads required documents
3. **Admin receives notification** → Pending count increases
4. Admin reviews documents in verification page
5. Admin approves/rejects
6. User receives SMS/Push notification
7. If approved: User can start using platform
8. If rejected: User sees reason, can re-apply

### Admin Daily Workflow
1. Login as Admin → Auto-redirect to Verification page
2. See pending count badge
3. Review each submission:
   - Check personal info
   - Preview all documents
   - Verify document numbers
4. Make decision:
   - Approve → User onboarded, SMS sent
   - Reject → User notified with reason
5. Switch to Hub Management tab
6. Monitor hub statistics
7. Create new hubs for expansion
8. Activate/deactivate hubs as needed

---

## Security & Compliance

### Document Privacy
- Documents only visible to admin users
- Secure URLs with expiration
- HTTPS only
- No caching of sensitive images

### Role-Based Access
- Only users with `role: 'Admin'` can access `/admin/*`
- Auth guard to check role before navigation
- API endpoints require admin JWT token

### Audit Trail (TODO)
- Log all approval/rejection actions
- Track admin user who made decision
- Timestamp all actions
- Store rejection reasons

### Data Retention
- Approved documents: Keep for 7 years (compliance)
- Rejected documents: Delete after 90 days
- Audit logs: Permanent retention

---

## Next Steps

### Phase 1: Backend Integration
1. Create backend controllers for verification and hub management
2. Implement SMS service (Twilio/AWS SNS)
3. Set up document storage (S3/Azure)
4. Add real-time notification system

### Phase 2: Enhanced KYC
1. OCR for automatic document data extraction
2. Government ID verification API integration
3. Face matching between selfie and ID
4. Duplicate detection

### Phase 3: Analytics Dashboard
1. Approval/rejection rates
2. Average verification time
3. Document quality metrics
4. Hub performance analytics

### Phase 4: Multi-Admin Support
1. Admin roles: Super Admin, Verifier, Hub Manager
2. Permission system
3. Admin activity tracking
4. Approval workflows (2-step verification)

---

## Testing Instructions

### Test Admin Login
```
1. Navigate to http://localhost:4200/auth/login
2. Select "Admin" role
3. Enter phone: 9876543210
4. Click "Send OTP"
5. Enter OTP: 123456
6. You'll be redirected to http://localhost:4200/admin/verification
```

### Test Verification Workflow
```
1. You'll see 3 pending users
2. Click on any user card to expand details
3. Click document cards to preview (opens modal)
4. Click "Approve & Send Welcome SMS"
   - Confirm approval
   - User disappears from list
   - Toast shows success message
   - Check console for SMS log
5. Click "Reject Application"
   - Enter rejection reason
   - Confirm rejection
   - User disappears from list
   - Check console for SMS log
```

### Test Hub Management
```
1. Click "Hub Management" tab
2. View stats: Total hubs, Active, Vendors, Transporters
3. Scroll to see hub cards (Azadpur, Mumbai)
4. Click "Create New Hub" button
5. Fill form:
   - Name: "Test Mandi"
   - Click "Use Current Location" (allow browser location)
   - Adjust radius slider
   - Select timezone, currency, languages
6. Click "Create Hub"
7. New hub appears in grid
8. Test Edit/Delete/Toggle Status on any hub
```

### Test Navigation
```
1. From Verification page, click "Hub Management" tab
2. From Hubs page, click "KYC Verification" tab
3. Verify URL changes and content loads correctly
4. Selected tab stays highlighted
```

---

## Support

For issues or questions:
- Check console logs for errors
- Verify mock data is loading
- Ensure Angular dev server is running on port 4200
- Restart server if new files not detected (TypeScript cache issue)

---

## Summary

✅ **Admin Login**: Added Admin role to login page with auto-redirect
✅ **KYC Verification**: Complete document audit system with approval/rejection workflow
✅ **Hub Management**: Global mandi onboarding with geofencing and multi-currency support
✅ **Navigation**: Seamless tab-based navigation between admin sections
✅ **Notifications**: Automated SMS/Push notifications on approval/rejection
✅ **Mock Data**: Development-ready with 3 pending users and 2 hubs
✅ **Responsive UI**: Professional admin dashboard with hover effects and animations
✅ **Search & Filter**: Real-time search across all user data with role-based tabs

**Ready for backend integration when API endpoints are available!**
