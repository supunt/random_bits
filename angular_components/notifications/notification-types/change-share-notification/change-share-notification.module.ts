import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeShareNotificationComponent } from './change-share-notification.component';
import { CommonNotificaionButtonsModule } from '../../common-notificaion-buttons/common-notificaion-buttons.module';
import { NotificationLoadingErrorModule } from '../../notification-loading-error/notification-loading-error.module';

@NgModule({
  imports: [
    CommonModule,
    CommonNotificaionButtonsModule,
    NotificationLoadingErrorModule
  ],
  declarations: [ChangeShareNotificationComponent],
  exports: [ChangeShareNotificationComponent]
})
export class ChangeShareNotificationModule { }
