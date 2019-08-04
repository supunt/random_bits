import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GMapLocation, LocationAddress, AddresstoString } from '../../models';

declare var google: any;

@Component({
  selector: 'ror-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
  private geoCoder: any = null;

  public location: GMapLocation;

  @Input() mapLocation: LocationAddress;
  @ViewChild(AgmMap) map: AgmMap;

  constructor(public mapsApiLoader: MapsAPILoader) {
                this.location = new GMapLocation();
                this.location.lng = 144.916;
                this.location.lat = -37.87;
                this.location.zoom = 20;
                this.location.viewport = true;
              }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.mapsApiLoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
      if (this.mapLocation !== null) {
        this.findLocation(AddresstoString(this.mapLocation));
      }
    });
  }

  private findLocation(address) {
    console.log('Location query : ', address);
    if (!this.geoCoder) {
      this.geoCoder = new google.maps.Geocoder();
    }
    this.geoCoder.geocode({
      'address': address
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK &&
          Array.isArray(results) &&
          results.length === 1) {
          this.location.lng = results[0].geometry.location.lng();
          this.location.lat = results[0].geometry.location.lat();
          this.location.viewport = results[0].geometry.viewport;
          // TODO incorporate
          // const newViewPort = new google.maps.LatLngBounds();
          this.map.triggerResize(true);
      } else {
        console.error('Failed to load map location');
      }
    });
  }
}

