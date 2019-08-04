import { NgModule } from '@angular/core';
import { foobarOwnershipNotificationModule } from './foobar-ownership-notification/foobar-ownership-notification.module';
import { MessageNotificationModule } from './message-notification/message-notification.module';
import { ChangeShareNotificationModule } from './change-share-notification/change-share-notification.module';
import { foobarTransferOwnershipModule } from './foobar-transfer-ownership/foobar-transfer-ownership.module';
import { foobarRegNotificationModule } from './foobar-reg-notification/foobar-reg-notification.module';

@NgModule({
  exports: [
    foobarOwnershipNotificationModule,
    MessageNotificationModule,
    ChangeShareNotificationModule,
    foobarTransferOwnershipModule,
    foobarRegNotificationModule
  ],
})
export class NotificationTypesModule { }
