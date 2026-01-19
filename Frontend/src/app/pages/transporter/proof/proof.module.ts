import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProofPageRoutingModule } from './proof-routing.module';
import { ProofPage } from './proof.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProofPageRoutingModule
  ],
  declarations: [ProofPage]
})
export class ProofPageModule {}
