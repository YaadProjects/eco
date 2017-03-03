import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from 'ionic-native';

@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  devices = []

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    //Start scanning for BLE devices
    this.scan();
  }

  scan(){
    console.log("Scanning has started");
    BLE.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    setTimeout(() => {
      BLE.stopScan().then(() => {
        console.log("Scanning has stopped");
        console.log(JSON.stringify(this.devices))
      });
    }, 3000);
  }

}
