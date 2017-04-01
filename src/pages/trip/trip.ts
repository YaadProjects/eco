import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Geolocation, BackgroundMode, Network } from 'ionic-native';
import { HomePage } from '../home/home';

declare var google;

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  location = [{name: "Latitude", value: "Obtaining Location..."}, {name: "Longitude", value: "Obtaining Location..."}];
  data = [{name: "MPG", unit: "mpg", value: 0}, {name: "Speed", unit: "km/h", value: 0}]
  shouldShowMap: boolean = true;
  hasMapLoaded: boolean = false;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;
  path: any;
  coords: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {
    if(Network.type === "none" || Network.type === "unknown"){
      this.shouldShowMap = false;
    }
  }

  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);

    Geolocation.watchPosition().subscribe(position => {
      if(position.coords !== undefined && position.coords.accuracy < 100){
        if(this.shouldShowMap){
          let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          if(!this.hasMapLoaded){
            this.loadMap(latLng);
          }
          this.marker.setPosition(latLng);
          this.map.setCenter(latLng);
          this.coords.push({lat: position.coords.latitude, lng: position.coords.longitude});
          this.path.setPath(this.coords);
        }
        console.log("Location: " + position.coords.latitude + ' ' + position.coords.longitude + ' accuracy: ' + position.coords.accuracy);
        this.location[0].value = String(position.coords.latitude);
        this.location[1].value = String(position.coords.longitude);
      }
    });
  }

  loadMap(latLng: any){
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      streetViewControl: false
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        strokeColor: '#1E88E5'
      }
    });
    this.coords = [];
    this.path = new google.maps.Polyline({
      path: this.coords,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.path.setMap(this.map);
    this.hasMapLoaded = true;
  }

  endTrip(){
    //TODO Save the trip
    this.navCtrl.setRoot(HomePage);
  }

  ionViewDidLeave(){
    BackgroundMode.disable();
    this.menuCtrl.swipeEnable(true);
  }

}
