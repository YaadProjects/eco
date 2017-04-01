import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Trips } from '../../app/services/trips';
import { TripDetailPage } from '../trip-detail/trip-detail';

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html'
})
export class TripsPage {

  trips : Array<any>

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.trips = Trips.trips;
    this.trips.push({date: "2017-03-01", startTime: "15:00", endTime: "20:00", id: 1}) // TODO REMOVE
  }

  viewTrip(trip){
    this.navCtrl.push(TripDetailPage, {trip : trip});
  }

  deleteTrip(trip){
    for(let i = 0; i < this.trips.length; i++){
      if(this.trips[i].id === trip.id){
        this.trips.splice(i, 1);
        Trips.deleteTrip(trip.id);
      }
    }
  }

}
