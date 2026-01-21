import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmDeliveryPage } from './confirm-delivery.page';

const routes: Routes = [
  {
    path: ':orderId',
    component: ConfirmDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmDeliveryPageRoutingModule {}
