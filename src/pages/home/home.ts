import { Component } from '@angular/core';

import { NavController, MenuController, AlertController } from 'ionic-angular';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { EntryPage } from '../entry/entry';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';
import { VehicleSelectPage } from '../vehicle-select/vehicle-select';
import { TripPage } from '../trip/trip';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private device : any = {name: "Unknown Adapter", id: "Unknown ID"};
  private vehicle: any = {name: "Not Selected"}

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public menuCtrl: MenuController, private storage: Storage, public modalCtrl: ModalController, public events: Events) {
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
    this.storage.get("vehicle").then(data => {
      if(data != null){
        let ecoData = JSON.parse(data);
        console.log(JSON.stringify(ecoData))
        this.navCtrl.setRoot(TripPage);
      }else{
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: 'You need to select a vehicle before starting a trip',
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }

  ionViewDidEnter(){
    this.updateVehicle();
    this.menuCtrl.swipeEnable(true);
  }

  updateVehicle(){
    this.storage.ready().then(() => {
      this.storage.get("vehicleName").then(name => {
        if(name != null){
          this.vehicle.name = name;
        }else{
          this.vehicle.name = "Not Selected";
        }
      });
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
