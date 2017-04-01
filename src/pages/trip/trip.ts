import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Geolocation, BackgroundMode } from 'ionic-native';

declare var google;

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  private location = [{name: "Latitude", value: "Obtaining Location..."}, {name: "Longitude", value: "Obtaining Location..."}];
  private data = [{name: "MPG", unit: "mpg", value: 0}, {name: "CO2", unit: "g/mile", value: 0}, {name: "Speed", unit: "km/h", value: 0}]

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {}

  private hasMapLoaded: boolean = false;
  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);

    Geolocation.watchPosition().subscribe(position => {
      if(position.coords !== undefined){
        let marker;
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if(!this.hasMapLoaded){
          let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            streetViewControl: false
          }
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
          marker = new google.maps.Marker({
            position: latLng,
            map: this.map,
          });
        }
        marker.position = latLng;
        console.log("Location: " + position.coords.latitude + ' ' + position.coords.longitude);
        this.location[0].value = String(position.coords.latitude);
        this.location[1].value = String(position.coords.longitude);
      }
    });
  }

  ionViewDidLeave(){
    BackgroundMode.disable();
    this.menuCtrl.swipeEnable(true);
  }

}
