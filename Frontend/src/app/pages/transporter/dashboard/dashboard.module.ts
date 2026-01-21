import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TransporterDashboardPageRoutingModule } from './dashboard-routing.module';
import { TransporterDashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransporterDashboardPageRoutingModule
  ],
  declarations: [TransporterDashboardPage]
})
export class TransporterDashboardPageModule {}
