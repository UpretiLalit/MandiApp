import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.TransporterDashboardPageModule)
  },
  {
    path: 'active-trip',
    loadChildren: () => import('./active-trip/active-trip.module').then(m => m.ActiveTripPageModule)
  },
  {
    path: 'delivering',
    loadChildren: () => import('./delivering/delivering.module').then(m => m.DeliveringPageModule)
  },
  {
    path: 'confirm-delivery',
    loadChildren: () => import('./confirm-delivery/confirm-delivery.module').then(m => m.ConfirmDeliveryPageModule)
  },
  {
    path: 'deliveries',
    loadChildren: () => import('./deliveries/deliveries.module').then(m => m.DeliveriesPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)
  },
  {
    path: 'scan',
    loadChildren: () => import('./scan/scan.module').then(m => m.ScanPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransporterPageRoutingModule {}
