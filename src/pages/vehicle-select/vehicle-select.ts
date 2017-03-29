import { Component } from '@angular/core';
import { NavController, NavParams, Events, ViewController } from 'ionic-angular';
import { CarData } from '../../app/services/cardata';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-vehicle-select',
  templateUrl: 'vehicle-select.html'
})
export class VehicleSelectPage {
  years: string[] = []; //Auto generated to prevent unnecessary work
  makes: string[] = [];
  models: string[] = [];

  curr_page: number = 0

  year: string = ""
  make: string = ""
  model: string = ""

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public events: Events, public storage: Storage) {}

  ionViewDidLoad() {
    //Auto Generate Years
    var startYear: number = 2018
    var yearsBack: number = 23

    for(var i = 0; i < yearsBack; i++) {
      var year = startYear - i
      this.years.push(year.toString())
    }
  }

  nextPage(enteredValue) {
    if(this.curr_page == 0) {
      this.year = enteredValue;
      this.generateMakes();
      this.curr_page += 1
    } else if(this.curr_page == 1) {
      this.make = enteredValue;
      this.generateModels();
      this.curr_page += 1
    } else if(this.curr_page == 2) {
      this.model = enteredValue;
      let vehicleName = this.year + " " + this.make + " " + this.model;
      this.storage.set("vehicleName", vehicleName).then(() => {
        this.storage.set("vehicle", JSON.stringify(CarData.carData[this.year][this.make][this.model])).then(() => {
          this.events.publish('vehicle:selected', vehicleName);
          this.navCtrl.pop();
        });
      });
    }
  }

  generateMakes() {
    this.makes = [];
    let makes = Object.keys(CarData.carData[this.year]);
    for(let i = 0; i < makes.length; i++){
      this.makes.push(makes[i]);
    }
  }

  generateModels() {
    this.models = [];
    let models = Object.keys(CarData.carData[this.year][this.make]);
    for(let i = 0; i < models.length; i++){
      this.models.push(models[i]);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
