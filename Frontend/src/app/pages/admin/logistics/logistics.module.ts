import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogisticsPageRoutingModule } from './logistics-routing.module';
import { LogisticsPage } from './logistics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogisticsPageRoutingModule
  ],
  declarations: [LogisticsPage]
})
export class LogisticsPageModule {}
