import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActiveTripPageRoutingModule } from './active-trip-routing.module';
import { ActiveTripPage } from './active-trip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActiveTripPageRoutingModule
  ],
  declarations: [ActiveTripPage]
})
export class ActiveTripPageModule {}
