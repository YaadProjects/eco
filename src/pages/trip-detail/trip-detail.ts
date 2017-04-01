import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-trip-detail',
  templateUrl: 'trip-detail.html'
})
export class TripDetailPage {

  trip: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.trip = navParams.get("trip");
  }

}
