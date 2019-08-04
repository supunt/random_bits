import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoFactorAuthComponent } from './two-factor-auth.component';
import { AtElementsModule } from "src/app/shared/elements/modules";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    AtElementsModule,
    ReactiveFormsModule,
    RouterModule 
  ],
  exports: [TwoFactorAuthComponent],
  declarations: [TwoFactorAuthComponent]
})
export class TwoFactorAuthModule { }