import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HubsPage } from './hubs.page';

const routes: Routes = [
  {
    path: '',
    component: HubsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HubsPageRoutingModule {}
