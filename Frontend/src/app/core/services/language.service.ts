import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguage.asObservable();

  private readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'hi', 'mr'];
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en';
  private _httpClient?: HttpClient;

  constructor(
    private translateService: TranslateService,
    private injector: Injector
  ) {
    this.initializeLanguage();
  }

  private get http(): HttpClient {
    if (!this._httpClient) {
      this._httpClient = this.injector.get(HttpClient);
    }
    return this._httpClient;
  }

  /**
   * Initialize language from localStorage or user profile
   */
  public initializeLanguage(): void {
    // Set available languages
    this.translateService.addLangs(this.SUPPORTED_LANGUAGES);
    this.translateService.setDefaultLang(this.DEFAULT_LANGUAGE);

    // Get saved language from localStorage
    const savedLanguage = this.getCurrentLanguage();
    if (savedLanguage && this.SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      this.translateService.use(savedLanguage);
      this.currentLanguage.next(savedLanguage);
    } else {
      // Fallback to browser language or default
      const browserLang = this.translateService.getBrowserLang() as SupportedLanguage;
      const langToUse = this.SUPPORTED_LANGUAGES.includes(browserLang) 
        ? browserLang 
        : this.DEFAULT_LANGUAGE;
      this.setLanguage(langToUse);
    }

    // Set HTML lang attribute
    document.documentElement.lang = this.getCurrentLanguage();
  }

  /**
   * Load language (for backward compatibility)
   */
  async loadLanguage(langCode: string) {
    this.setLanguage(langCode as SupportedLanguage);
  }

  getCurrentLanguage(): string {
    return this.translateService.currentLang || localStorage.getItem('app_language') || 'en';
  }

  /**
   * Set language and persist to localStorage and backend
   */
  setLanguage(lang: SupportedLanguage): void {
    if (!this.SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language '${lang}' not supported. Falling back to '${this.DEFAULT_LANGUAGE}'`);
      lang = this.DEFAULT_LANGUAGE;
    }

    // Update translate service
    this.translateService.use(lang);
    
    // Update observable
    this.currentLanguage.next(lang);
    
    // Save to localStorage
    localStorage.setItem('app_language', lang);

    // Set HTML lang attribute
    document.documentElement.lang = lang;

    // Save to backend (if user is authenticated)
    this.updateUserLanguageOnBackend(lang).subscribe({
      next: () => console.log(`✅ Language updated to '${lang}' on backend`),
      error: (err) => console.error('Failed to update language on backend:', err)
    });
  }

  /**
   * Translate a key using ngx-translate
   */
  translate(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Get translation observable
   */
  get(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  /**
   * Get instant translation
   */
  instant(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
    ];
  }

  /**
   * Set language from JWT token claim (called after login)
   */
  setLanguageFromToken(languageClaim: string): void {
    const lang = languageClaim as SupportedLanguage;
    if (this.SUPPORTED_LANGUAGES.includes(lang)) {
      this.setLanguage(lang);
    }
  }

  /**
   * Update language preference on backend
   */
  private updateUserLanguageOnBackend(language: SupportedLanguage): Observable<any> {
    // Get user ID from token or auth service
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // User not logged in, skip backend update
      return of(null);
    }

    // Update user language via API
    return this.http.patch(`${environment.identityApiUrl}/users/language`, { language }).pipe(
      tap(() => console.log(`✅ Language '${language}' saved to backend`))
    );
  }
}

