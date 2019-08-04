import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageNotificationComponent } from './message-notification.component';
import { CommonNotificaionButtonsModule } from '../../common-notificaion-buttons/common-notificaion-buttons.module';
import { NotificationLoadingErrorModule } from '../../notification-loading-error/notification-loading-error.module';

@NgModule({
  imports: [
    CommonModule,
    CommonNotificaionButtonsModule,
    NotificationLoadingErrorModule
  ],
  declarations: [MessageNotificationComponent],
  exports: [MessageNotificationComponent]
})
export class MessageNotificationModule { }
