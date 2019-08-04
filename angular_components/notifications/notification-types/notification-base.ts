import { Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { BaseNotification, NotificationType } from 'src/app/shared/exports';
import { NotificationDetailService } from 'src/app/shared/services/exports';
import { CommonProperties } from 'src/app/shared/classes/exports';
import { AjaxResponse, MhrUserAction } from 'src/app/shared/models/exports';

export abstract class NotificationBase extends CommonProperties implements OnDestroy {

    @Input() model: MhrUserAction = null;
    @Input() darkTheme = false;
    @Output() notificationClosed = new EventEmitter<any>();
    @Output() notificationActioned = new EventEmitter<any>();

    public viewModel: BaseNotification = null;
    public notificationType: NotificationType;
    public loadingDetails = false;
    protected detailUrlPrefix = '';

    constructor(protected notificationDetailService: NotificationDetailService) {
        super();
        this.model = null;
        this.notificationType = NotificationType.Unset;
    }

    protected abstract LoadViewModel(): void;

    // ------------------------------------------------------------------------------------
    public Hide(): void {
        this.notificationClosed.emit();
    }

    // ------------------------------------------------------------------------------------
    public OnInit() {
        this.LoadViewModel();
    }

    // ------------------------------------------------------------------------------------
    public Actioned(accpeted: boolean) {
        this.notificationActioned.emit(accpeted);
    }

    // ------------------------------------------------------------------------------------
    public ngOnDestroy(): void {
        this.unsubscribe();
    }

    // ------------------------------------------------------------------------------------
    public GetThemeClass( ) {
        return this.darkTheme ? 'w-100 expantion-table-dark' : 'w-100 expantion-table';
    }

    // ------------------------------------------------------------------------------------
    protected LoadDetailsFromUri(): void {
        // minimize detail loadup
        if (this.model.viewData) {
            this.viewModel = this.model.viewData;
            return;
        }

        if (this.notificationDetailService == null) {
            return;
        }

        this.loadingDetails = true;
        this.rxs(this.notificationDetailService.LoadDetails(this.model, this.detailUrlPrefix).subscribe(
            (response: AjaxResponse<any>) => {
                this.loadingDetails = false;
                if (response.isError) {
                    console.error('Error while loading details for notification ' + this.model.code, response.errorMessage)
                    this.viewModel = null;
                    return;
                }

                this.viewModel = response.responseData;
                this.model.viewData = response.responseData;
            },
            err => {
                this.loadingDetails = false;
                console.error('Error while loading notification details', err);
            }
        ));
    }
}
