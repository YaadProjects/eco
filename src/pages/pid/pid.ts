import { Component } from '@angular/core';

import { Storage } from '@ionic/storage';
import { NavController, AlertController } from 'ionic-angular';
import { BLE } from 'ionic-native';

import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble';
import { PidDataProcess } from './dataprocess';

@Component({
  selector: 'page-pid',
  templateUrl: 'pid.html'
})
export class PidPage {

  private sensors = [];
  private static sensorsCache = [];
  private static timer = null;
  private static init: boolean = false;
  public static rawSensorData = {};
  private primaryFuel : any;

  constructor(public navCtrl: NavController, private storage: Storage, public alertCtrl: AlertController) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    this.storage.ready().then(() => {
      this.storage.get("vehicle").then(info => {
        if(info != null){
          this.primaryFuel = JSON.parse(info).primaryFuel;

          if(!PidPage.init){
            PidPage.init = true;
            this.pushSensor("010C", "GENERAL", "Vehicle RPM", "rpm");
            this.pushSensor("0110", "ENGINE", "Mass Air Flow", "g/sec");
            this.pushSensor("010D", "GENERAL", "Vehicle Speed", "km/h");
            this.pushSensor("0105", "ENGINE", "Engine Coolant Temperature", "°C", "°F", celcius => {return celcius * 1.8 + 32})
            this.pushSensor("0111", "ENGINE", "Throttle Position", "%")

            this.pushSensor("_MPG", "GENERAL", "Fuel Economy", "kml", "mpg", kml => {return 2.35215 * kml}, (pid, obj, sensor) => {
              let densityOfFuel = 6.17;
              let fuelName = obj.primaryFuel.name;
              if(fuelName.indexOf("Diesel") >= 0){
                densityOfFuel = 6.943;
              }
              let mpg = "0.00";
              let maf = PidPage.rawSensorData["0110"];
              let speed = PidPage.rawSensorData["010D"];

              if(maf != null && speed != null && maf != 0){
                mpg = ((14.7 * densityOfFuel * 4.54 * speed * 0.621371) / (3600 * maf / 100)).toFixed(2);
              }
              obj.updateSensor(pid, obj.appendUnits(mpg, sensor));
            });
          }else{
            this.sensors = PidPage.sensorsCache;
          }

          PidPage.timer = setInterval(() => {
            BLE.isConnected(Bluetooth.uuid).then(() => {
              for(let i = 0 ; i < this.sensors.length; i++){
                this.update(this.sensors[i].pid);
              }
            }).catch(() => {
              HomePage.bleError(navCtrl, storage);
            });
          }, 750);
        }else{
          console.log("No vehicle selected");
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: 'You need to select a vehicle before using this page',
            buttons: ['OK']
          });
          alert.present();
          navCtrl.setRoot(HomePage);
          return;
        }
      });
    });
  }

  pushSensor(pid: string, category: string, name: string, unit: string, iUnit?: string, iUnitFunction?: any, updateFunction?: any){
    if(pid.includes("_")){
      this.pushSensorIntoArray(pid, category, name, unit, iUnit, iUnitFunction, updateFunction);
    }else{
      Bluetooth.writeToUUID(pid + "\r").then(data => {
        if(!data.includes("NO_DATA")){
          this.pushSensorIntoArray(pid, category, name, unit, iUnit, iUnitFunction, updateFunction);
        }else{
          if(pid === "0110" || pid === "010D"){
            console.log("Vehicle is missing either 10 or 0D PIDs");
            this.showNoPidError();
            this.navCtrl.setRoot(HomePage);
            PidPage.init = false;
          }
        }
      }).catch(err => {
        console.log("Engine is probably not in the ON state");
        this.showNoPidError();
        this.navCtrl.setRoot(HomePage);
        PidPage.init = false;
      });
    }
  }

  pushSensorIntoArray(pid: string, category: string, name: string, unit: string, iUnit?: string, iUnitFunction?: any, updateFunction?: any){
    let item = {pid: pid, name: name, value: "NO DATA", category: category, unit: unit, updateFunction: null};
    if(iUnit != null){
      item["iUnit"] = iUnit;
      item["iUnitFunction"] = iUnitFunction;
    }
    item["updateFunction"] = updateFunction != null ? updateFunction : this.bluetoothUpdateFunction;
    this.sensors.push(item);
    PidPage.sensorsCache.push(item);
  }

  update(pid: string){
    for(let i = 0; i < this.sensors.length; i++){
      if(this.sensors[i].pid === pid){
        console.log("For PID: " + pid + " the update function is: " + this.sensors[i].updateFunction);
        this.sensors[i].updateFunction(pid, this, this.sensors[i]);
      }
    }
  }

  appendUnits(data, sensor){
    let iUnitConvert = sensor.iUnitFunction;
    let iUnit = sensor.iUnit;
    let unit = sensor.unit;

    if(PidDataProcess.useImperialUnits && iUnitConvert != null){
      return String(data + iUnit);
    }else{
      return String(data + unit);
    }
  }

  updateSensor(pid: string, data){
    for(let i = 0; i < this.sensors.length; i++){
      if(this.sensors[i].pid === pid){
        this.sensors[i].value = data;
      }
    }
  }

  //DO NOT USE this. functions, it will fail!
  bluetoothUpdateFunction(pid, obj, sensor){
    Bluetooth.writeToUUID(pid + "\r").then(data => {
      if(!data.includes("NO_DATA")){
        for(let i = 0; i < obj.sensors.length; i++){
          if(obj.sensors[i].pid === pid){
            let raw_data = PidDataProcess.getData(pid, data);
            PidPage.rawSensorData[pid] = raw_data;
            obj.updateSensor(pid, obj.appendUnits(raw_data, obj.sensors[i]));
          }
        }
      }
    });
  }


  private static hasShownError: boolean = false;
  showNoPidError() {
    if(!PidPage.hasShownError){
      PidPage.hasShownError = true;
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'This vehicle is either missing sensors or you have not turned the engine to the ON state',
        buttons: ['OK']
      });
      alert.present().then(() => {
        PidPage.hasShownError = false;
        Bluetooth.adapterInit = false;
      });
    }
  }

  ionViewWillLeave(){
    clearInterval(PidPage.timer);
  }

}
