import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent } from './google-map.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({apiKey: environment.googleCloudPlatformAPIKey}),
  ],
  declarations: [GoogleMapComponent],
  exports: [GoogleMapComponent]
})
export class GoogleMapModule { }
