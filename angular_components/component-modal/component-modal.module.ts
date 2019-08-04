import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModalComponent } from './component-modal.component';
import { TwoFactorAuthComponent } from '../two-factor-auth/two-factor-auth.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ComponentModalComponent],
  exports: [ComponentModalComponent],
  entryComponents: [ComponentModalComponent, TwoFactorAuthComponent],
})
export class ComponentModalModule { }
