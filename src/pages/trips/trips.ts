import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Trips } from '../../app/services/trips';
import { TripDetailPage } from '../trip-detail/trip-detail';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html'
})
export class TripsPage {

  trips : Array<any>

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {
    this.trips = Trips.trips;
  }

  viewTrip(trip){
    this.navCtrl.push(TripDetailPage, {trip : trip});
  }

  deleteTrip(trip){
    for(let i = 0; i < this.trips.length; i++){
      if(this.trips[i].id === trip.id){
        this.trips.splice(i, 1);
        Trips.deleteTrip(trip.id);
        Trips.storeToStorage(this.storage);
      }
    }
  }

}
