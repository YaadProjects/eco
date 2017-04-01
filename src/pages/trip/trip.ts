import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';
import { Geolocation, BackgroundMode } from 'ionic-native';

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  private location = [{name: "Latitude", value: "Obtaining Location..."}, {name: "Longitude", value: "Obtaining Location..."}];
  private data = [{name: "MPG", unit: "mpg", value: 0}, {name: "CO2", unit: "g/mile", value: 0}, {name: "Speed", unit: "km/h", value: 0}]

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {}

  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);
    Geolocation.watchPosition().subscribe(position => {
      if(position.coords !== undefined){
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
