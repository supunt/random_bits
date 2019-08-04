import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { TwoFactorRequestService } from 'src/app/shared/services/apis/two-factor-request/two-factor-request.service';
import { Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonProperties, ToNameValuePairs, PersonService, TwoFactorAuthenticationSource, } from 'src/app/shared/exports';
import { Observable } from 'rxjs';

@Component({
  selector: 'ror-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent extends CommonProperties implements OnInit {

  public twoFactorForm: FormGroup;
  public requesting: boolean;
  public requestDisabled: boolean;
  public validateDisabled: boolean;
  public TwoFactorError: boolean;
  public TwoFactorErrorMessage: string;
  public isLoading: boolean;

  @Input() isModal = false;
  @Input() twoFactorType: TwoFactorAuthenticationSource = TwoFactorAuthenticationSource.ChangePassword;
  @Input() message = '';
  @Output() twoFactorCompleted = new EventEmitter<any>();
  @Output() twoFactorCancelled = new EventEmitter<any>();

  public ddl2FaOptions = [];

  // ---------------------------------------------------------------------------
  constructor(private formBuilder: FormBuilder,
    private twoFactorRequestService: TwoFactorRequestService,
    private personService: PersonService) {
    super();
    this.twoFactorForm = this.formBuilder.group({
      ddlOptions: '',
      twoFactorCode: ''
    });

    this.twoFactorForm.disable();

    // Request user options
    this.isLoading = true;
    this.requesting = true;

    this.ClearTwoFactorError();
  }

  // ---------------------------------------------------------------------------
  ClearTwoFactorError(): any {
    this.TwoFactorError = false;
    this.TwoFactorErrorMessage = '';
  }

  // ---------------------------------------------------------------------------
  ngOnInit() {
    this.requestDisabled = true;
    this.validateDisabled = true;

    this.rxs(this.personService.getTwofactorOptions(this.twoFactorType).subscribe(
      data => {
        this.On2FaOptionsData(data);
      },
      err => {
        this.On2FaOptionsError();
      }));

    // Options subscription
    this.rxs(this.twoFactorForm.controls.ddlOptions.valueChanges.subscribe(
      data => {
        this.requestDisabled = data.trim() !== '' ? false : true;
      }
    ));

    // input change subscription
    this.rxs(this.twoFactorForm.controls.twoFactorCode.valueChanges.subscribe(
      data => {
        this.validateDisabled = data.trim() !== '' ? false : true;
      }
    ));
  }

  // ---------------------------------------------------------------------------
  public Requets2FACode(): void {

    if (this.twoFactorForm.value.ddlOptions.trim() === '') {
      return;
    }

    this.ClearTwoFactorError();
    this.requestDisabled = true;

    this.rxs(this.twoFactorRequestService.Get2FaCode(this.twoFactorForm.controls.ddlOptions.value, this.twoFactorType).subscribe(
      data => {
        if (data.isError) {
          this.OnCodeRequestFailed(data.errorMessage);
          return;
        }
        this.requesting = false; // to disable initially
        this.validateDisabled = true;
      },
      err => {
        this.OnCodeRequestFailed(err);
      }
    ));
  }

  // ---------------------------------------------------------------------------
  public Validate2FACode(): void {

    if (this.twoFactorForm.value.twoFactorCode.trim() === '') {
      return;
    }

    this.ClearTwoFactorError();
    this.validateDisabled = true;

    this.rxs(this.twoFactorRequestService.SubmitCode(this.twoFactorForm.value.twoFactorCode, this.twoFactorType).subscribe(
      data => {
        if (data.isError) {
          this.OnCodeValidationFailed(data.errorMessage);
          return;
        }

        if (data.responseData) {
          this.twoFactorCompleted.emit();
        } else {
          this.TwoFactorError = true;
          this.TwoFactorErrorMessage = 'Invalid code';
        }
      },
      err => {
        this.OnCodeValidationFailed(err);
      }
    ));

  }

  // ---------------------------------------------------------------------------
  public ngDestroy() {
    this.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  public Cancal2FA() {
    this.twoFactorCancelled.emit();
  }

  // ---------------------------------------------------------------------------
  private OnCodeRequestFailed(message: string) {
    console.error('2FA request failed. ERROR : ' + message);
    this.requesting = true;
    this.requestDisabled = false;
    this.validateDisabled = true;

    this.TwoFactorError = true;
    this.TwoFactorErrorMessage = 'Failed to request two factor authentication code';
  }

  // ---------------------------------------------------------------------------
  private OnCodeValidationFailed(message: string) {
    console.error('2FA validation failed. ERROR : ' + message);
    this.validateDisabled = false;

    this.TwoFactorError = true;
    this.TwoFactorErrorMessage = 'Failed to validate two factor authentication code';
  }

  // ---------------------------------------------------------------------------
  private On2FaOptionsData(data) {
    this.isLoading = false;
    if (data.isError) {
      this.TwoFactorError = true;
      this.TwoFactorErrorMessage = 'Failed to load authentication options';
    } else {
      this.twoFactorForm.enable();
      this.ddl2FaOptions = ToNameValuePairs(data.responseData);

      if (data.responseData['TEXT'] !== undefined) {
        this.twoFactorForm.controls.ddlOptions.setValue('TEXT');
      } else if (data.responseData['EMAIL'] !== undefined) {
        this.twoFactorForm.controls.ddlOptions.setValue('EMAIL');
      }
    }
  }

  // ---------------------------------------------------------------------------
  private On2FaOptionsError() {
    this.isLoading = false;
    this.TwoFactorError = true;
    this.TwoFactorErrorMessage = 'Failed to load authentication options';
  }
}
