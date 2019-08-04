import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationTableComponent } from './notification-table.component';
import { NotificationTypesModule } from '../notification-types/notification-types.module';

@NgModule({
  imports: [
    CommonModule,
    NotificationTypesModule,

  ],
  declarations: [NotificationTableComponent],
  exports: [NotificationTableComponent],
})
export class NotificationsTableModule { }
