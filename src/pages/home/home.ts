import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { EntryPage } from '../entry/entry';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private device : any = {name: "Unknown Adapter", id: "Unknown ID"};

  private static adapterInit = false;


  constructor(public navCtrl: NavController, private storage: Storage) {
    console.log("home.ts with uuid: " + Bluetooth.uuid);
    if(Bluetooth.uuid != null){
      BLE.isConnected(Bluetooth.uuid).then(() => {
        this.device = Bluetooth.device;
        if(!HomePage.adapterInit){
          Bluetooth.startNotification();
          Bluetooth.writeToUUID("ATZ\r");
          Bluetooth.writeToUUID("ATSP0\r").then(result => {
            HomePage.adapterInit = true;
            console.log("Initialization is complete");
          }).catch(() => {
            this.bleError();
          });
        }
      }).catch(() => {
        this.bleError();
      });
    }else{
      this.bleError();
    }
  }

  bleError(){
    console.log("Not connected to BLE device at home.ts for device: " + Bluetooth.uuid);
    this.storage.ready().then(() => {
     this.storage.set('uuid', null);
     this.storage.set('name', null);

     console.log("Attempted to disconnect at bleError()");
     BLE.disconnect(Bluetooth.uuid).then(() => {
       this.navCtrl.setRoot(EntryPage);
     }).catch(() => {
       this.navCtrl.setRoot(EntryPage);
     });
    });
  }

}
