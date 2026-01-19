import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { QuickUpdatePageRoutingModule } from './quick-update-routing.module';
import { QuickUpdatePage } from './quick-update.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuickUpdatePageRoutingModule
  ],
  declarations: [QuickUpdatePage]
})
export class QuickUpdatePageModule {}
