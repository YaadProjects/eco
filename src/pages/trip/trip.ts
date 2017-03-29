import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  private location = {lat: 0, lng: 0};
  private data = {mpg: 0, co2: 0, speed: 0}

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {}

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
    Geolocation.watchPosition().subscribe(position => {
      if(position.coords !== undefined){
        console.log("Location: " + position.coords.latitude + ' ' + position.coords.longitude);
        this.location.lat = position.coords.latitude;
        this.location.lng = position.coords.longitude;
      }
    });
  }

}
