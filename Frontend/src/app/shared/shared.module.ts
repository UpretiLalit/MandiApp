import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductNamePipe, CategoryNamePipe, UnitNamePipe } from './pipes/product-translator.pipe';

@NgModule({
  declarations: [
    LanguageSelectorComponent,
    ProductCardComponent,
    ProductNamePipe,
    CategoryNamePipe,
    UnitNamePipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    LanguageSelectorComponent,
    ProductCardComponent,
    ProductNamePipe,
    CategoryNamePipe,
    UnitNamePipe
  ]
})
export class SharedModule { }
