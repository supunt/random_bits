import { Component, OnInit } from '@angular/core';
import { NotificationBase } from '../notification-base';
import { NotificationDetailService, NotificationType, MessageNotificationDetails, NotificationStatus, dateFromSimpleString } from 'src/app/shared/exports';
import { MhrUserAction, AjaxResponse } from 'src/app/shared/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ror-change-share-notification',
  templateUrl: './change-share-notification.component.html',
  styleUrls: ['./change-share-notification.component.scss']
})
export class ChangeShareNotificationComponent extends NotificationBase implements OnInit {

  // Ctor
  constructor(notificationDetailService: NotificationDetailService) {
    super(notificationDetailService);
    this.detailUrlPrefix = 'GetOwnerShareConfirmation';
    this.notificationType = NotificationType.ChangeOwnershipShare;
  }

  ngOnInit() {
    super.OnInit();
  }
  public dateFromSimpleString(dateStr: string) {
    return dateFromSimpleString(dateStr);
  }


  protected LoadViewModel(): void {
    super.LoadDetailsFromUri();
  }

  // Override Actioned callback
  public Actioned(actionData: boolean) {
    const actionDataStr = actionData ? 'accept' : 'decline';
    if (this.model.status !== NotificationStatus.Completed) {
      this.rxs(this.notificationDetailService.setOwnerShareConfirmation(this.model, actionDataStr).subscribe(
        (response: AjaxResponse<any>) => {
          if (response.isError) {
            console.error('Failed action the notification. Error : ', response.errorMessage);
            return;
          }
          if (response.responseData) {
               this.model.status = response.responseData.status;
               this.model.viewData = response.responseData;
               super.Actioned(actionData);
          }
        },
        err => { console.error('Failed to action the notification. Error ', err); }
      ));
    }
  }
}
