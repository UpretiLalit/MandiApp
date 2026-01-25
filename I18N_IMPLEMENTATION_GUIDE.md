# Internationalization (i18n) Implementation Guide

## Overview
This guide documents the complete internationalization implementation for MandiApp with support for English, Hindi, and Marathi languages.

## Supported Languages
- **English (en)**: Default language
- **Hindi (hi)**: हिंदी
- **Marathi (mr)**: मराठी

## Architecture

### Backend Changes

#### 1. ApplicationUser Model
Location: `Backend/Services/Identity.API/Models/ApplicationUser.cs`

The `Language` property already exists:
```csharp
public string Language { get; set; } = "en";
```

#### 2. JWT Token Claims
Location: `Backend/Services/Identity.API/Services/TokenService.cs`

Added language claim to JWT tokens:
```csharp
new Claim("language", user.Language ?? "en"), // Language preference for i18n
```

#### 3. Auth Controller Updates
Location: `Backend/Services/Identity.API/Controllers/AuthController.cs`

**API Responses Updated**:
- `verify-otp` response includes `user.Language`
- `register` response includes `user.Language`

**New Endpoint**:
```csharp
[Authorize]
[HttpPatch("users/language")]
public async Task<IActionResult> UpdateLanguage([FromBody] UpdateLanguageRequest request)
```

Validates language code (en, hi, mr) and updates user preference.

#### 4. DTOs
Location: `Backend/Services/Identity.API/DTOs/AuthDTOs.cs`

Added:
```csharp
public record UpdateLanguageRequest(string Language);
```

Updated RegisterRequest to include:
```csharp
string Language = "en"
```

### Frontend Changes

#### 1. Package Installation
Installed packages:
- `@ngx-translate/core@15.0.0`
- `@ngx-translate/http-loader@8.0.0`

Command used:
```bash
npm install @ngx-translate/core@15 @ngx-translate/http-loader@8 --legacy-peer-deps
```

#### 2. App Module Configuration
Location: `Frontend/src/app/app.module.ts`

Added imports:
```typescript
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
```

Added to imports array:
```typescript
TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient]
  }
})
```

#### 3. App Component Initialization
Location: `Frontend/src/app/app.component.ts`

Initializes language service on app startup:
```typescript
constructor(
  private platform: Platform,
  private languageService: LanguageService
) {
  this.initializeApp();
}

initializeApp() {
  // Initialize language service first
  this.languageService.initializeLanguage();
  // ... rest of initialization
}
```

#### 4. Language Service
Location: `Frontend/src/app/core/services/language.service.ts`

**Key Methods**:

- `initializeLanguage()`: Sets up translate service with available languages
- `setLanguage(lang: SupportedLanguage)`: Changes language and persists to localStorage + backend
- `setLanguageFromToken(languageClaim: string)`: Extracts language from JWT and applies it
- `updateUserLanguageOnBackend(language)`: PATCH request to save preference
- `translate()`, `instant()`, `get()`: Wrapper methods for ngx-translate

**Supported Languages Type**:
```typescript
export type SupportedLanguage = 'en' | 'hi' | 'mr';
```

#### 5. Auth Service Integration
Location: `Frontend/src/app/core/services/auth.service.ts`

Added JWT token language extraction:
```typescript
private extractAndSetLanguageFromToken(token: string): void {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const languageClaim = payload.language || payload.Language;
    
    if (languageClaim) {
      this.languageService.setLanguageFromToken(languageClaim);
    }
  } catch (error) {
    console.error('Error extracting language from token:', error);
  }
}
```

Called automatically after login in `saveAuthData()`.

#### 6. Translation Files
Location: `Frontend/src/assets/i18n/`

Three files exist with matching key structures:
- `en.json` - English translations
- `hi.json` - Hindi translations (हिंदी)
- `mr.json` - Marathi translations (मराठी)

**Translation Structure**:
```json
{
  "common": { "app_name", "welcome", "login", "logout", ... },
  "auth": { "phone_number", "enter_phone", "otp", ... },
  "products": { "product_management", "add_product", ... },
  "orders": { ... },
  "vendor": { ... },
  "buyer": { ... },
  "transporter": { ... }
}
```

#### 7. Language Selector Component
Location: `Frontend/src/app/shared/components/language-selector/`

**Features**:
- Displays current language with flag emoji
- Opens action sheet with language options
- Shows selected language with highlight
- Calls `languageService.setLanguage()` on selection

**Usage**:
```html
<app-language-selector></app-language-selector>
```

**Languages with Icons**:
- 🇬🇧 English
- 🇮🇳 हिंदी (Hindi)
- 🇮🇳 मराठी (Marathi)

#### 8. Shared Module
Location: `Frontend/src/app/shared/shared.module.ts`

Exports:
- `LanguageSelectorComponent`
- `TranslateModule` (for use in lazy-loaded modules)

Import this module in pages that need translation or language selector:
```typescript
import { SharedModule } from '@app/shared/shared.module';
```

## Usage Guide

### In TypeScript Components

```typescript
import { LanguageService } from '@app/core/services/language.service';

constructor(private languageService: LanguageService) {}

// Get translated text
title = this.languageService.instant('common.app_name');

// Translate with parameters
message = this.languageService.translate('auth.resend_in', { seconds: 30 });

// Get current language
currentLang = this.languageService.getCurrentLanguage();

// Change language
this.languageService.setLanguage('hi');
```

### In HTML Templates

```html
<!-- Simple translation -->
<h1>{{ 'common.welcome' | translate }}</h1>

<!-- With parameters -->
<p>{{ 'auth.resend_in' | translate:{seconds: countdown} }}</p>

<!-- In attributes -->
<ion-button [attr.aria-label]="'common.save' | translate">
  {{ 'common.save' | translate }}
</ion-button>
```

### Adding Language Selector to Pages

1. Import SharedModule in your page module:
```typescript
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule, // Add this
    YourPageRoutingModule
  ]
})
```

2. Add to template:
```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <app-language-selector></app-language-selector>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

### During Registration

The registration form should include language selection:

```html
<ion-item>
  <ion-label position="stacked">{{ 'auth.preferred_language' | translate }}</ion-label>
  <ion-select [(ngModel)]="registrationForm.language" interface="action-sheet">
    <ion-select-option value="en">English</ion-select-option>
    <ion-select-option value="hi">हिंदी</ion-select-option>
    <ion-select-option value="mr">मराठी</ion-select-option>
  </ion-select>
</ion-item>
```

## Flow Diagrams

### Login Flow with Language
```
1. User enters phone number
2. Receives OTP
3. Verifies OTP
4. Backend returns JWT token with "language" claim
5. AuthService extracts language from JWT
6. LanguageService applies language preference
7. UI loads in user's preferred language
```

### Language Change Flow
```
1. User clicks language selector
2. Action sheet opens with options
3. User selects new language
4. LanguageService.setLanguage() called:
   - Updates TranslateService
   - Saves to localStorage
   - Sends PATCH request to backend
   - Updates currentLanguage$ observable
5. UI immediately switches to new language
6. Backend user record updated
7. Language persists across sessions
```

## API Endpoints

### Update User Language
```http
PATCH /api/users/language
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "hi"
}

Response:
{
  "message": "Language updated successfully",
  "language": "hi"
}
```

### Register with Language
```http
POST /api/auth/register
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "fullName": "John Doe",
  "role": "Vendor",
  "language": "mr",  // Optional, defaults to "en"
  ...
}
```

## Testing Checklist

- [ ] Login and verify language claim in JWT token (decode at jwt.io)
- [ ] Check language extracted from token and UI loads correctly
- [ ] Change language using selector
- [ ] Verify localStorage updated (`app_language` key)
- [ ] Verify backend API called (check Network tab)
- [ ] Verify UI text switches immediately
- [ ] Logout and login again
- [ ] Verify language preference persists
- [ ] Test all three languages (en, hi, mr)
- [ ] Test registration with language selection
- [ ] Test language selector in different pages
- [ ] Verify translations display correctly for all keys
- [ ] Test language switching without authentication

## Known Issues & Limitations

1. **Translation File Coverage**: Not all UI strings may be translated yet. Add missing keys to all three language files.

2. **RTL Support**: Hindi and Marathi use LTR layout. If RTL languages are added later, CSS updates needed.

3. **Date/Number Formatting**: ngx-translate doesn't automatically format dates/numbers by locale. Consider adding:
   ```typescript
   import { registerLocaleData } from '@angular/common';
   import localeHi from '@angular/common/locales/hi';
   import localeMr from '@angular/common/locales/mr';
   
   registerLocaleData(localeHi);
   registerLocaleData(localeMr);
   ```

4. **Lazy-Loaded Modules**: Import `SharedModule` (not `TranslateModule.forRoot()`) in lazy-loaded modules.

## Future Enhancements

1. **Dynamic Content Translation**: Product names, categories, order statuses from database
2. **Translation Management**: Admin panel to manage translations
3. **Language Detection**: Auto-detect from browser/device settings
4. **Offline Support**: Cache translations for offline use
5. **Voice Input**: Add speech-to-text in user's language
6. **More Languages**: Add Punjabi, Tamil, Telugu, etc.

## File Structure Summary

```
Backend/Services/Identity.API/
├── Controllers/AuthController.cs (Updated)
├── DTOs/AuthDTOs.cs (Updated)
├── Models/ApplicationUser.cs (Language property exists)
└── Services/TokenService.cs (Updated)

Frontend/src/
├── app/
│   ├── app.module.ts (Updated)
│   ├── app.component.ts (Updated)
│   ├── core/services/
│   │   ├── language.service.ts (Rewritten)
│   │   └── auth.service.ts (Updated)
│   └── shared/
│       ├── shared.module.ts (New)
│       └── components/language-selector/
│           ├── language-selector.component.ts (New)
│           ├── language-selector.component.html (New)
│           └── language-selector.component.scss (New)
└── assets/i18n/
    ├── en.json (Exists)
    ├── hi.json (Exists)
    └── mr.json (Exists)
```

## Quick Start Commands

```bash
# Install frontend dependencies
cd Frontend
npm install

# Start frontend (will load translations from assets/i18n/)
npm start

# Start backend (Identity API with language support)
cd Backend/Services/Identity.API
dotnet run

# Test language API endpoint
curl -X PATCH http://localhost:5003/api/users/language \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "hi"}'
```

## Troubleshooting

### Translations Not Loading
1. Check browser console for HTTP errors loading JSON files
2. Verify `./assets/i18n/` path in HttpLoaderFactory
3. Ensure translation files are valid JSON
4. Check if TranslateModule.forRoot() is in AppModule

### Language Not Persisting
1. Check localStorage for `app_language` key
2. Verify JWT token includes "language" claim (jwt.io)
3. Check Network tab for PATCH /users/language request
4. Verify backend endpoint authorization

### Component Translation Not Working
1. Import SharedModule in page module
2. Use `| translate` pipe in template
3. Or inject LanguageService and use `instant()`
4. Check if translation key exists in all JSON files

## Support

For issues or questions about i18n implementation:
1. Check translation files have matching keys across all languages
2. Verify backend JWT includes language claim
3. Check browser console for ngx-translate errors
4. Test with simple keys like `common.welcome` first
