import { Component, OnInit } from '@angular/core';
import { NotificationBase } from '../notification-base';
import { NotificationType, NotificationService } from 'src/app/shared/exports';
import { MessageNotificationDetails } from 'src/app/shared/models/exports';

@Component({
  selector: 'ror-message-notification',
  templateUrl: './message-notification.component.html',
  styleUrls: ['./message-notification.component.scss']
})
export class MessageNotificationComponent extends NotificationBase implements OnInit {

  // ---------------------------------------------------------------------------------
  constructor() {
    super(null);
    this.notificationType = NotificationType.Message;
  }

  // ---------------------------------------------------------------------------------
  ngOnInit() {
    super.OnInit();
  }

  // ---------------------------------------------------------------------------------
  protected LoadViewModel(): void {
    if (this.model.extraParams['message']) {
      this.viewModel = new MessageNotificationDetails(this.model.extraParams['message']);
    }
  }
}
