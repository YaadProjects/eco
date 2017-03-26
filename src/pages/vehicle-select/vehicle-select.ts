import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CarData } from '../../app/services/cardata';

@Component({
  selector: 'page-vehicle-select',
  templateUrl: 'vehicle-select.html'
})
export class VehicleSelectPage {

  years = []
  makes = []

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let yearKeys = Object.keys(CarData.carData);
    for(let i = 0; i < yearKeys.length; i++){
      this.years.push(yearKeys[i]);
    }
  }

  yearChanged(year){
    this.makes = [];
    let makes = Object.keys(CarData.carData[year]);
    for(let i = 0; i < makes.length; i++){
      this.makes.push(makes[i]);
    }
  }

}
