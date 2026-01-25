import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ProductTranslatorService } from '@app/core/services/product-translator.service';
import { LanguageService } from '@app/core/services/language.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'productName',
  pure: false
})
export class ProductNamePipe implements PipeTransform, OnDestroy {
  private value: string = '';
  private lastKey: string = '';
  private lastOutput: string = '';
  private subscription?: Subscription;

  constructor(
    private translator: ProductTranslatorService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to language changes to force pipe update
    this.subscription = this.languageService.currentLanguage$.subscribe((lang) => {
      console.log('ProductNamePipe: Language changed to', lang);
      if (this.lastKey) {
        this.value = this.translator.translateProductName(this.lastKey);
        this.lastOutput = this.value;
        console.log('ProductNamePipe: Translated', this.lastKey, 'to', this.value);
        // Force change detection
        this.cdr.markForCheck();
      }
    });
  }

  transform(productName: string): string {
    if (!productName) return '';
    
    // Only update lastKey if input is different from our last output
    // This prevents caching translated values as keys
    if (productName !== this.lastOutput) {
      this.lastKey = productName;
    }
    
    this.value = this.translator.translateProductName(this.lastKey);
    this.lastOutput = this.value;
    return this.value;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@Pipe({
  name: 'categoryName',
  pure: false
})
export class CategoryNamePipe implements PipeTransform, OnDestroy {
  private value: string = '';
  private lastKey: string = '';
  private lastOutput: string = '';
  private subscription?: Subscription;

  constructor(
    private translator: ProductTranslatorService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.languageService.currentLanguage$.subscribe((lang) => {
      console.log('CategoryNamePipe: Language changed to', lang);
      if (this.lastKey) {
        this.value = this.translator.translateCategory(this.lastKey);
        this.lastOutput = this.value;
        this.cdr.markForCheck();
      }
    });
  }

  transform(category: string): string {
    if (!category) return '';
    
    // Only update lastKey if input is different from our last output
    if (category !== this.lastOutput) {
      this.lastKey = category;
    }
    
    this.value = this.translator.translateCategory(this.lastKey);
    this.lastOutput = this.value;
    return this.value;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@Pipe({
  name: 'unitName',
  pure: false
})
export class UnitNamePipe implements PipeTransform, OnDestroy {
  private value: string = '';
  private lastKey: string = '';
  private lastOutput: string = '';
  private subscription?: Subscription;

  constructor(
    private translator: ProductTranslatorService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.languageService.currentLanguage$.subscribe((lang) => {
      console.log('UnitNamePipe: Language changed to', lang);
      if (this.lastKey) {
        this.value = this.translator.translateUnit(this.lastKey);
        this.lastOutput = this.value;
        this.cdr.markForCheck();
      }
    });
  }

  transform(unit: string): string {
    if (!unit) return '';
    
    // Only update lastKey if input is different from our last output
    if (unit !== this.lastOutput) {
      this.lastKey = unit;
    }
    
    this.value = this.translator.translateUnit(this.lastKey);
    this.lastOutput = this.value;
    return this.value;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
