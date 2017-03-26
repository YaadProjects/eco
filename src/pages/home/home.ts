import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { EntryPage } from '../entry/entry';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';
import { StartTripPage } from '../start-trip/start-trip';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private device : any = {name: "Unknown Adapter", id: "Unknown ID"};

  constructor(public navCtrl: NavController, private storage: Storage, public modalCtrl: ModalController) {
    if(Bluetooth.uuid != null){
      BLE.isConnected(Bluetooth.uuid).then(() => {
        this.device = Bluetooth.device;
        if(!Bluetooth.adapterInit){
          Bluetooth.startNotification();
          Bluetooth.writeToUUID("ATZ\r").catch(() => {
            HomePage.bleError(navCtrl, storage);
          });
          Bluetooth.writeToUUID("ATSP0\r").then(result => {
            Bluetooth.adapterInit = true;
            console.log("Initialization is complete");
          }).catch(() => {
            HomePage.bleError(navCtrl, storage);
          });
        }
      }).catch(() => {
        HomePage.bleError(navCtrl, storage);
      });
    }else{
      HomePage.bleError(navCtrl, storage);
    }
  }

  startTrip(){
    console.log("Starting Trip")
    let modal = this.modalCtrl.create(StartTripPage);
    modal.present();
  }

  public static bleError(navCtrl, storage){
    console.log("Not connected to BLE device at home.ts for device: " + Bluetooth.uuid);
    storage.ready().then(() => {
     storage.set('uuid', null);
     storage.set('name', null);

     console.log("Attempted to disconnect at bleError()");
     BLE.disconnect(Bluetooth.uuid).then(() => {
       navCtrl.setRoot(EntryPage);
     }).catch(() => {
       navCtrl.setRoot(EntryPage);
     });
    });
  }



}
