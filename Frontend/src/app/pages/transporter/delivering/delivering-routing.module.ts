import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveringPage } from './delivering.page';

const routes: Routes = [
  {
    path: ':orderId',
    component: DeliveringPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveringPageRoutingModule {}
