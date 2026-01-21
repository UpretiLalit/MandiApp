import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HubsPageRoutingModule } from './hubs-routing.module';
import { HubsPage } from './hubs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HubsPageRoutingModule
  ],
  declarations: [HubsPage]
})
export class HubsPageModule {}
