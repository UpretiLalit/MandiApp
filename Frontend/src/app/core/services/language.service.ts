import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguage.asObservable();

  private translations: any = {};

  constructor() {
    this.loadLanguage(this.getCurrentLanguage());
  }

  async loadLanguage(langCode: string) {
    try {
      const response = await fetch(`/assets/i18n/${langCode}.json`);
      this.translations = await response.json();
      this.currentLanguage.next(langCode);
      localStorage.setItem('app_language', langCode);
      
      // Set HTML lang attribute
      document.documentElement.lang = langCode;
    } catch (error) {
      console.error('Error loading language:', error);
      // Fallback to English
      if (langCode !== 'en') {
        await this.loadLanguage('en');
      }
    }
  }

  getCurrentLanguage(): string {
    return localStorage.getItem('app_language') || 'en';
  }

  translate(key: string, params?: any): string {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string' && params) {
      // Replace {{param}} with actual values
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return typeof value === 'string' ? value : key;
  }

  setLanguage(langCode: string) {
    this.loadLanguage(langCode);
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
    ];
  }
}
