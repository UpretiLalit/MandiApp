import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ConfirmDeliveryPageRoutingModule } from './confirm-delivery-routing.module';
import { ConfirmDeliveryPage } from './confirm-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmDeliveryPageRoutingModule
  ],
  declarations: [ConfirmDeliveryPage]
})
export class ConfirmDeliveryPageModule {}
