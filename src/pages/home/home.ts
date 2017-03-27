import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { EntryPage } from '../entry/entry';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';
import { VehicleSelectPage } from '../vehicle-select/vehicle-select';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private device : any = {name: "Unknown Adapter", id: "Unknown ID"};
  private vehicle: any = {name: "Not Selected"}

  constructor(public navCtrl: NavController, private storage: Storage, public modalCtrl: ModalController, public events: Events) {
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

    events.subscribe('vehicle:selected', (user, time) => {
      this.updateVehicle();
    });
  }

  selectVehicle(){
    let modal = this.modalCtrl.create(VehicleSelectPage);
    modal.present();
  }

  startTrip(){

  }

  ionViewDidEnter(){
    this.updateVehicle();
  }

  updateVehicle(){
    this.storage.ready().then(() => {
      this.storage.get("vehicleName").then(name => {
        this.vehicle.name = name;
      }).catch(err => {
        // Do nothing
      })
    });
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
