import { Component, ElementRef, ViewChild } from '@angular/core';

import { Storage } from '@ionic/storage';
import { NavController, AlertController, MenuController } from 'ionic-angular';
import { BLE, BackgroundMode, Network, Geolocation } from 'ionic-native';

import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble';
import { PidDataProcess } from './dataconvert';

declare var google;

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  private sensors = [];
  private static sensorsCache = [];
  private static timer = null;
  private static init: boolean = false;
  public static rawSensorData = {};
  private primaryFuel : any;

  constructor(public navCtrl: NavController, private storage: Storage, public alertCtrl: AlertController, public menuCtrl: MenuController) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    if(Network.type === "none" || Network.type === "unknown"){
      this.shouldShowMap = false;
    }

    this.storage.ready().then(() => {
      this.storage.get("vehicle").then(info => {
        if(info != null){
          this.primaryFuel = JSON.parse(info).primaryFuel;

          if(!TripPage.init){
            TripPage.init = true;
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
              let maf = TripPage.rawSensorData["0110"];
              let speed = TripPage.rawSensorData["010D"];

              if(maf != null && speed != null && maf != 0){
                mpg = ((14.7 * densityOfFuel * 4.54 * speed * 0.621371) / (3600 * maf / 100)).toFixed(2);
              }
              obj.updateSensor(pid, obj.appendUnits(mpg, sensor));
            });
          }else{
            this.sensors = TripPage.sensorsCache;
          }

          TripPage.timer = setInterval(() => {
            BLE.isConnected(Bluetooth.uuid).then(() => {
              for(let i = 0 ; i < this.sensors.length; i++){
                this.update(this.sensors[i].pid);
              }
            }).catch(() => {
              HomePage.bleError(navCtrl, storage);
            });
          }, 1000);
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
            TripPage.init = false;
          }
        }
      }).catch(err => {
        console.log("Engine is probably not in the ON state");
        this.showNoPidError();
        this.navCtrl.setRoot(HomePage);
        TripPage.init = false;
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
    TripPage.sensorsCache.push(item);
  }

  update(pid: string){
    for(let i = 0; i < this.sensors.length; i++){
      if(this.sensors[i].pid === pid){
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
            TripPage.rawSensorData[pid] = raw_data;
            obj.updateSensor(pid, obj.appendUnits(raw_data, obj.sensors[i]));
          }
        }
      }
    });
  }


  private static hasShownError: boolean = false;
  showNoPidError() {
    if(!TripPage.hasShownError){
      TripPage.hasShownError = true;
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'This vehicle is either missing sensors or you have not turned the engine to the ON state',
        buttons: ['OK']
      });
      alert.present().then(() => {
        TripPage.hasShownError = false;
        Bluetooth.adapterInit = false;
      });
    }
  }

  //Maps
  location = [{name: "Latitude", value: "Obtaining Location..."}, {name: "Longitude", value: "Obtaining Location..."}];
  shouldShowMap: boolean = true;
  hasMapLoaded: boolean = false;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;
  path: any;
  coords: any;
  positionWatch: any;

  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);

    let options = {
      enableHighAccuracy: true
    }
    this.positionWatch = Geolocation.watchPosition(options).subscribe(position => {
      if(position.coords !== undefined){
        if(position.coords.accuracy < 100){
          if(this.shouldShowMap){
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            if(!this.hasMapLoaded){
              this.loadMap(latLng);
            }
            this.marker.setPosition(latLng);
            this.map.setCenter(latLng);
            this.coords.push({lat: position.coords.latitude, lng: position.coords.longitude});
            this.path.setPath(this.coords);
          }
          this.location[0].value = String(position.coords.latitude);
          this.location[1].value = String(position.coords.longitude);
        }
        console.log("Location: " + position.coords.latitude + ' ' + position.coords.longitude + ' accuracy: ' + position.coords.accuracy);
        console.log(JSON.stringify(this.coords));
      }
    });
  }

  loadMap(latLng: any){
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      streetViewControl: false
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        strokeColor: '#1E88E5'
      }
    });
    this.coords = [];
    this.path = new google.maps.Polyline({
      path: this.coords,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.path.setMap(this.map);
    this.hasMapLoaded = true;
  }

  endTrip(){
    //TODO Save the trip
    this.navCtrl.setRoot(HomePage);
  }

  ionViewDidLeave(){
    clearInterval(TripPage.timer);
    this.positionWatch.unsubscribe();

    BackgroundMode.disable();
    this.menuCtrl.swipeEnable(true);
  }

}
