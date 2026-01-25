import { Injectable, Injector } from '@angular/core';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ProductTranslatorService {
  private _languageService?: LanguageService;

  constructor(private injector: Injector) {}

  private get languageService(): LanguageService {
    if (!this._languageService) {
      this._languageService = this.injector.get(LanguageService);
    }
    return this._languageService;
  }

  /**
   * Translate product name from English to current language
   * Handles plurals, compound names, and various formats
   */
  translateProductName(englishName: string): string {
    if (!englishName) return '';
    
    // Check if current language is English - return original
    const currentLang = this.languageService.getCurrentLanguage();
    console.log('ProductTranslator: Current language is', currentLang, 'translating', englishName);
    
    if (currentLang === 'en') {
      return englishName;
    }
    
    // First, try exact match in products section (legacy support for "Tomatoes", "Potatoes" etc)
    let translated = this.languageService.instant(`products.${englishName}`);
    if (translated && translated !== `products.${englishName}`) {
      console.log('ProductTranslator: Found in products section:', translated);
      return translated;
    }
    
    // Convert to snake_case key format
    let key = englishName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace(/-/g, '_');
    
    // Try product_names.{key}
    translated = this.languageService.instant(`product_names.${key}`);
    if (translated && translated !== `product_names.${key}`) {
      console.log('ProductTranslator: Found in product_names:', key, '→', translated);
      return translated;
    }
    
    // Handle plurals: Remove trailing 's' or 'es' and try again
    const singularKey = this.toSingular(key);
    if (singularKey !== key) {
      translated = this.languageService.instant(`product_names.${singularKey}`);
      if (translated && translated !== `product_names.${singularKey}`) {
        console.log('ProductTranslator: Found singular form:', singularKey, '→', translated);
        return translated;
      }
    }
    
    // Handle compound names: Try without color/size prefix (e.g., "Red Onions" → "onion")
    const simplifiedKey = this.removePrefix(key);
    if (simplifiedKey !== key) {
      translated = this.languageService.instant(`product_names.${simplifiedKey}`);
      if (translated && translated !== `product_names.${simplifiedKey}`) {
        console.log('ProductTranslator: Found simplified form:', simplifiedKey, '→', translated);
        return translated;
      }
    }
    
    // If all else fails, return original name
    console.warn('ProductTranslator: No translation found for', englishName, 'returning original');
    return englishName;
  }
  
  /**
   * Convert plural to singular form
   */
  private toSingular(word: string): string {
    // Handle special cases
    const specialCases: { [key: string]: string } = {
      'tomatoes': 'tomato',
      'potatoes': 'potato',
      'mangoes': 'mango',
      'onions': 'onion',
      'carrots': 'carrot',
      'apples': 'apple',
      'bananas': 'banana',
      'oranges': 'orange',
      'grapes': 'grape'
    };
    
    if (specialCases[word]) {
      return specialCases[word];
    }
    
    // Remove 'es' ending
    if (word.endsWith('es') && word.length > 3) {
      return word.slice(0, -2);
    }
    
    // Remove 's' ending
    if (word.endsWith('s') && word.length > 2) {
      return word.slice(0, -1);
    }
    
    return word;
  }
  
  /**
   * Remove color/size prefix from compound names
   */
  private removePrefix(key: string): string {
    const prefixes = ['red_', 'green_', 'yellow_', 'white_', 'black_', 'big_', 'small_', 'fresh_'];
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        const withoutPrefix = key.substring(prefix.length);
        return this.toSingular(withoutPrefix);
      }
    }
    return key;
  }

  /**
   * Translate category name
   */
  translateCategory(category: string): string {
    if (!category) return '';
    
    const key = category.toLowerCase();
    const translated = this.languageService.instant(`categories.${key}`);
    
    if (translated === `categories.${key}`) {
      return category;
    }
    
    return translated;
  }

  /**
   * Translate unit
   */
  translateUnit(unit: string): string {
    if (!unit) return '';
    
    const key = unit.toLowerCase();
    const translated = this.languageService.instant(`units.${key}`);
    
    if (translated === `units.${key}`) {
      return unit;
    }
    
    return translated;
  }

  /**
   * Get common product name mappings for dropdown/autocomplete
   */
  getCommonProducts(): Array<{english: string, translated: string}> {
    const products = [
      'tomato', 'potato', 'onion', 'cabbage', 'cauliflower', 'carrot',
      'brinjal', 'ladyfinger', 'spinach', 'coriander', 'green_chilli',
      'capsicum', 'beetroot', 'radish', 'pumpkin', 'bitter_gourd',
      'bottle_gourd', 'ridge_gourd', 'drumstick', 'mango', 'banana',
      'apple', 'orange', 'grapes', 'watermelon', 'papaya', 'guava',
      'pomegranate', 'pineapple', 'coconut', 'rice', 'wheat', 'jowar',
      'bajra', 'ragi', 'maize', 'toor_dal', 'moong_dal', 'chana_dal',
      'masoor_dal', 'urad_dal', 'rajma', 'chickpeas'
    ];

    return products.map(key => ({
      english: this.toTitleCase(key.replace(/_/g, ' ')),
      translated: this.languageService.instant(`product_names.${key}`)
    }));
  }

  private toTitleCase(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
