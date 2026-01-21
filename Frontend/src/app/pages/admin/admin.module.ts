import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminPage } from './admin.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AdminPageRoutingModule
  ],
  declarations: [AdminPage]
})
export class AdminPageModule {}
