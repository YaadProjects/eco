import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { Bluetooth } from '../../app/services/ble';
import { BLE } from 'ionic-native';
import { PidDataProcess } from './dataprocess';

@Component({
  selector: 'page-pid',
  templateUrl: 'pid.html'
})
export class PidPage {

  private sensors = [];
  private static timer = null;

  constructor(public navCtrl: NavController, private storage: Storage) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    BLE.isConnected(Bluetooth.uuid).then(() => {
      this.pushSensor("010C", "GENERAL", "Vehicle RPM", "rpm");
      this.pushSensor("0110", "GENERAL", "Mass Air Flow", "g/sec");
      this.pushSensor("010D", "GENERAL", "Vehicle Speed", "km/h", "mph", kph => {return 0.621371 * kph});
    }).catch(() => {
      HomePage.bleError(navCtrl, storage);
    });

    PidPage.timer = setInterval(() => {
      BLE.isConnected(Bluetooth.uuid).then(() => {
        for(let i = 0 ; i < this.sensors.length; i++){
          this.updateSensor(this.sensors[i].pid);
        }
      }).catch(() => {
        HomePage.bleError(navCtrl, storage);
      });
    }, 1000);
  }

  pushSensor(pid: string, category: string, name: string, unit: string, iUnit?: string, iUnitFunction?: any){
    Bluetooth.writeToUUID(pid + "\r").then(data => {
      if(!data.includes("NO_DATA")){
        let item = {pid: pid, name: name, value: "NO DATA", category: category, unit: unit};
        if(iUnit != null){
          item["iUnit"] = iUnit;
          item["iUnitFunction"] = iUnitFunction;
        }
        this.sensors.push(item);
      }
    })
  }

  updateSensor(pid: string){
    Bluetooth.writeToUUID(pid + "\r").then(data => {
      if(!data.includes("NO_DATA")){
        for(let i = 0; i < this.sensors.length; i++){
          if(this.sensors[i].pid === pid){
            this.sensors[i].value = PidDataProcess.getData(pid, data, this.sensors[i].unit, this.sensors[i].iUnit, this.sensors[i].iUnitFunction);
          }
        }
      }
    });
  }

  ionViewDidLeave(){
    clearInterval(PidPage.timer);
  }

}
