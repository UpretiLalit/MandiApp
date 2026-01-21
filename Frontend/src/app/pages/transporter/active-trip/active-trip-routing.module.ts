import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActiveTripPage } from './active-trip.page';

const routes: Routes = [
  {
    path: ':orderId',
    component: ActiveTripPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActiveTripPageRoutingModule {}
