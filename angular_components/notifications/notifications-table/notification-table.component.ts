import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  NotificationService,
  CommonProperties,
  MhrUserAction,
  AjaxResponse,
  NotificationStatus,
  NotificationType,
  dateFromSimpleString
} from 'src/app/shared/exports';
import { NotificationtableType } from 'src/app/shared/constants/exports';
import { NotificationDetailService } from 'src/app/shared/services/exports';

@Component({
  selector: 'ror-notification-table',
  templateUrl: './notification-table.component.html',
  styleUrls: ['./notification-table.component.scss']
})
export class NotificationTableComponent extends CommonProperties implements OnInit, OnDestroy {

  public selectedRow = -1;
  public notifications: MhrUserAction[];
  public selectedNotification: MhrUserAction;
  public isLoading = false;

  @Input() TableType: NotificationtableType = NotificationtableType.Active;
  @Input() ReadOmly = false;

  constructor(private notificationService: NotificationService,
    private notificationDetailService: NotificationDetailService
  ) {
    super();
    this.notifications = [];
  }

  // ---------------------------------------------------------------------------------------
  public ngOnInit() {
    this.LoadData();
  }

  public dateFromSimpleString(dateStr: string) {
    return dateFromSimpleString(dateStr);
  }


  // ---------------------------------------------------------------------------------------
  public OpenNotification(notification: MhrUserAction) {
    if (this.ReadOmly) {
      return;
    }

    this.selectedNotification = notification;
  }

  // ---------------------------------------------------------------------------------------
  // This is the genaric accpet/decline method, if you need custom stuff
  // use the OnNotificationActionedCustom
  // ---------------------------------------------------------------------------------------
  public OnNotificationActioned(notification: MhrUserAction, accepted: boolean) {
    this.selectedNotification = notification;

    if (this.selectedNotification.status !== NotificationStatus.Accepted ||
      this.selectedNotification.status !== NotificationStatus.Declined) {
      this.rxs(this.notificationService.Actioned(notification, accepted).subscribe(
        (response: AjaxResponse<boolean>) => {
          if (response.isError) {
            console.error('Failed action the notification. Error : ', response.errorMessage);
            return;
          }

          notification.status = response.responseData ?
            (accepted ? NotificationStatus.Accepted : NotificationStatus.Declined) : notification.status;
        },
        err => { console.error('Failed to action the notification. Error ', err); }
      ));
    }
  }

  // ---------------------------------------------------------------------------------------
  // Use the MhrUserAction.actionCode enum to determine the type of the notification
  // Store custom accept/decline uri's
  //      in shared->models->notifications-><notificationType> classes as static readonly
  // ---------------------------------------------------------------------------------------
  public OnNotificationActionedCustom(notification: MhrUserAction, actionData: any) {
  }

  // ---------------------------------------------------------------------------------------
  public OnNotificationClosed(): void {
    this.selectedNotification = null;
  }

  // ---------------------------------------------------------------------------------------
  public GetStatusString(notification: MhrUserAction): string {

    switch (notification.actionCode) {
      case NotificationType.Message:
        if (notification.status !== NotificationStatus.Read) {
          return 'New';
        } else {
          return '';
        }
      case NotificationType.Ownership:
        if (notification.status !== NotificationStatus.Accepted &&
          notification.status !== NotificationStatus.Declined) {
          return 'Action Required';
        } else {
          return 'Completed';
        }
      case NotificationType.ChangeOwnershipShare:
      case NotificationType.otherfoobarTransferOutgoing:
      case NotificationType.otherfoobarTransferInComingMO:
      case NotificationType.TransferOutgoing:
      case NotificationType.TransferInComingMO:
      case NotificationType.Registration:
        if (notification.status !== NotificationStatus.Completed) {
          return 'Action Required';
        } else {
          return 'Completed';
        }
    }

    return '';
  }

  // ---------------------------------------------------------------------------------------
  public IsUnread(notification: MhrUserAction): boolean {
    return notification.status === NotificationStatus.New;
  }

  // ---------------------------------------------------------------------------------------
  public Refresh() {
    this.LoadData();
  }

  // ---------------------------------------------------------------------------------------
  public EmptyTableString() {
    return 'You do not have any ' +
      (this.TableType === NotificationtableType.Active ? 'new ' : '') +
      'notifications.';
  }

  // ---------------------------------------------------------------------------------------
  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  // ---------------------------------------------------------------------------------------
  private LoadData(): any {

    if (this.isLoading) {
      return;
    }

    this.notifications = [];
    this.isLoading = true;
    this.rxs(this.notificationService.get(this.TableType === NotificationtableType.Active).subscribe(
      (data: AjaxResponse<MhrUserAction[]>) => {

        this.isLoading = false;
        if (data.isError) {
          console.error('Failed to load notifications. Error : ', data.errorMessage);
          return;
        }

        this.notifications = data.responseData;
        this.PostFilterAndAssignOnStatus();
      },
      err => {
        this.isLoading = false;
        console.error('Failed to load notifications. Error : ', err);
      }
    ));
  }

  // ---------------------------------------------------------------------------------------
  private PostFilterAndAssignOnStatus(): any {

    if (this.TableType === NotificationtableType.Active) {
      this.notifications = this.notifications.filter(item => this.IsAnActiveItem(item));
    }
  }

  // ---------------------------------------------------------------------------------------
  public IsAnActiveItem(item: MhrUserAction): boolean {
    switch (item.actionCode) {
      case NotificationType.Message:
        return item.status === NotificationStatus.New;
      case NotificationType.Ownership:
        return (item.status !== NotificationStatus.Accepted && item.status !== NotificationStatus.Declined);
      case NotificationType.ChangeOwnershipShare:
      case NotificationType.otherfoobarTransferOutgoing:
      case NotificationType.otherfoobarTransferInComingMO:
      case NotificationType.TransferOutgoing:
      case NotificationType.TransferInComingMO:
        return (item.status !== NotificationStatus.Completed);
      case NotificationType.Registration:
        return (item.status !== NotificationStatus.Completed);
      default:
        return true;
    }
  }
}
