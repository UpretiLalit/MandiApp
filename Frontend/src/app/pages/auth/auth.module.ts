import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthPageRoutingModule } from './auth-routing.module';
import { AuthPage } from './auth.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AuthPageRoutingModule
  ],
  declarations: [AuthPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthPageModule {}
