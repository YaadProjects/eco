import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { EntryPage } from '../entry/entry';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  device : any = {name: "Unknown Adapter", id: "Unknown ID"};

  constructor(public navCtrl: NavController) {
    BLE.isConnected(Bluetooth.uuid).then(() => {
      this.device = Bluetooth.device;
    }).catch(() => {
      this.navCtrl.setRoot(EntryPage);
    });
  }

}
