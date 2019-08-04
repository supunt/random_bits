import { NgModule } from '@angular/core';
import { NotificationsTableModule } from './notifications-table/notification-table.module';
import { NotificationTypesModule } from './notification-types/notification-types.module';
import { NotificationLoadingErrorModule } from './notification-loading-error/notification-loading-error.module';

@NgModule({
  exports: [
    NotificationTypesModule,
    NotificationsTableModule,
    NotificationLoadingErrorModule
  ],
  declarations: []
})
export class NotificationsModule { }
