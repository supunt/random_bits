import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressSearchComponent } from './address-search.component';
import { AtElementsModule } from 'src/app/shared/elements/modules';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    AtElementsModule,
    ReactiveFormsModule
  ],
  declarations: [AddressSearchComponent],
  exports: [AddressSearchComponent]
})
export class AddressSearchModule {
}
