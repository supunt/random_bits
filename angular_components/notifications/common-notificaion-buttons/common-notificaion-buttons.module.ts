import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonNotificaionButtonsComponent } from './common-notificaion-buttons.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CommonNotificaionButtonsComponent],
  exports: [CommonNotificaionButtonsComponent]
})
export class CommonNotificaionButtonsModule { }
