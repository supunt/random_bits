import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Subject, Observable, throwError } from 'rxjs';
import { TotalCheckService } from 'src/app/shared/services/apis/total-check/total-check.service';
import { TotalCheckResult } from 'src/app/shared/models/total-check-result';
import { CommonProperties } from 'src/app/shared/classes/common-properties';
import { AjaxResponse, AddressSearchInterface } from 'src/app/shared/exports';
import { addError, FocusElement } from '../../utils/util';

@Component({
  selector: 'ror-address-search',
  templateUrl: './address-search.component.html',
  styleUrls: ['./address-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddressSearchComponent extends CommonProperties implements OnInit, OnDestroy, AddressSearchInterface  {

  public addresses: TotalCheckResult[] = [];
  private searchText$ = new Subject<any>();
  public formGroup: FormGroup;

  @Output() selectedAddress = new EventEmitter<any>();
  @Output() noMatchesFound = new EventEmitter<any>();
  @Output() addressSearchError = new EventEmitter<any>();
  @Input() toolTip = undefined;

  public showSearchResult = true;
  public skipSearchOnce = false;
  public ignoreInitEmit = true;
  public isLoading  = false;

  // --------------------------------------------------------------------------------
  constructor(
    private totalCheckService: TotalCheckService,
    private eRef: ElementRef,
    private formBuilder: FormBuilder) {
    super();
    this.formGroup = this.formBuilder.group({
      addressSearch: ''
    });
  }

  // --------------------------------------------------------------------------------
  public selectAddress(selectedAddress: TotalCheckResult): void {
    this.showSearchResult = false;
    this.skipSearchOnce = true;
    this.formGroup.controls.addressSearch.setValue(selectedAddress.formattedAddress);
    this.selectedAddress.emit(selectedAddress);
  }

  // --------------------------------------------------------------------------------
  @HostListener('document:click', ['$event'])
  searchFocusOut(event) {
    if (this.eRef.nativeElement.contains(event.target) !== true) {
      this.addresses = [];
      this.showSearchResult = false;
    }
  }

  // --------------------------------------------------------------------------------
  public ngOnInit(): void {
    // Supporting show hide of the control
    this.showSearchResult = false;
    this.formGroup.controls.addressSearch.setValue('');

    // Search field subscription
    this.rxs(this.formGroup.controls.addressSearch.valueChanges.subscribe((value: string) => {
      if (!this.skipSearchOnce) {
        if (value.length > 6) {
          this.resetErrors();
          this.searchText$.next(value);
        }
      } else {
        this.skipSearchOnce = false;
      }
    }));

    this.createDelayedSearchSubscription();
  }

  // ----------------------------------------------------------------------
  private createDelayedSearchSubscription(): void {
    // Serch delay
    this.rxs(this.searchText$.pipe(
      debounceTime(500),
      switchMap(text => {
          this.isLoading = true;
          return this.totalCheckService.get(text);
        }),
      catchError((e) => {
        this.showSearchResult = false;

        // return Observable.throw('error');
        return Observable.create(x => {
          x.next(
            {
              isError : true,
              errorMessage : e
            }
          );
          x.complete();

          // Error Destroys the debounceTime hence Resubscribe
          this.createDelayedSearchSubscription();
        });
      })
    ).subscribe(
      data => {
        this.isLoading = false;
        const apiData: AjaxResponse<TotalCheckResult[]> = Object.assign(data);
        if (apiData.isError) {
          console.error('Error while attempting address check : ' + apiData.errorMessage);
          this.addressSearchError.emit(apiData.errorMessage);
        } else {
          this.showSearchResult = true;
          this.addresses = apiData.responseData;

          if (this.addresses.length === 0) {
              this.noMatchesFound.emit();
          }
        }
      }
    ));
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public reset() {
    this.formGroup.controls.addressSearch.setValue('');
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public setError(error: string) {
    addError(this.formGroup.controls.addressSearch, error);
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public resetErrors() {
    this.formGroup.controls.addressSearch.setErrors(null);
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public FocusElement() {
    FocusElement(this.formGroup.controls.addressSearch);
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------
  public IsBusy(): boolean {
    return this.isLoading;
  }
}
