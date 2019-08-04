import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ror-common-notificaion-buttons',
  templateUrl: './common-notificaion-buttons.component.html',
  styleUrls: ['./common-notificaion-buttons.component.scss']
})
export class CommonNotificaionButtonsComponent implements OnInit {

  @Input() AcceptEnabled = false;
  @Input() DeclineEnabled = false;
  @Input() CancelEnabled = false;
  @Input() CloseEnabled = false;

  @Output() notificationClosed = new EventEmitter<any>();
  @Output() notificationActioned = new EventEmitter<any>();

  constructor() { }

  // -----------------------------------------------------------------------------------
  ngOnInit() {
  }

  // -----------------------------------------------------------------------------------
  public Hide() {
    this.notificationClosed.emit();
  }

  // -----------------------------------------------------------------------------------
  public Actioned(accepted: boolean) {
    this.notificationActioned.emit(accepted);
  }
}
