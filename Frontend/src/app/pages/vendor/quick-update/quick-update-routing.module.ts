import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuickUpdatePage } from './quick-update.page';

const routes: Routes = [
  {
    path: '',
    component: QuickUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickUpdatePageRoutingModule {}
