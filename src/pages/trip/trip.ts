import { Component } from '@angular/core';
import { NavController, NavParams, MenuController } from 'ionic-angular';

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {}

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
  }

}
