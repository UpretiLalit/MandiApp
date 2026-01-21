import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: '',
        redirectTo: 'verification',
        pathMatch: 'full'
      },
      {
        path: 'verification',
        loadChildren: () => import('./verification/verification.module').then(m => m.VerificationPageModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule)
      },
      {
        path: 'hubs',
        loadChildren: () => import('./hubs/hubs.module').then(m => m.HubsPageModule)
      },
      {
        path: 'marketplace',
        loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplacePageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('./products/products.module').then(m => m.ProductsPageModule)
      },
      {
        path: 'logistics',
        loadChildren: () => import('./logistics/logistics.module').then(m => m.LogisticsPageModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
