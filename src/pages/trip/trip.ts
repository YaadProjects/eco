import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  location = {lat: "", lng: ""};

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {}

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
    Geolocation.watchPosition().subscribe(position => {
      if(position.coords !== undefined){
        console.log("Location: " + position.coords.longitude + ' ' + position.coords.latitude);
        this.location.lat = String(position.coords.latitude);
        this.location.lng = String(position.coords.longitude);
      }
    });
  }

}
