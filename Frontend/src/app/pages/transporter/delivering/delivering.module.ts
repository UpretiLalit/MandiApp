import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeliveringPageRoutingModule } from './delivering-routing.module';
import { DeliveringPage } from './delivering.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveringPageRoutingModule
  ],
  declarations: [DeliveringPage]
})
export class DeliveringPageModule {}
