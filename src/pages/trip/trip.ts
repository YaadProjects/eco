import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';

import { Storage } from '@ionic/storage';
import { NavController, AlertController, MenuController } from 'ionic-angular';
import { BLE, BackgroundMode, Network, Geolocation } from 'ionic-native';

import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble';
import { Trips } from "../../app/services/trips";

declare var google;

//TODO: Make the interval adaptable - more than 20 objects in queue -> clear the queue and increase interval by 100ms
@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  //Sensors
  private sensors = [];
  private static timer = null;
  private primaryFuel : any;
  public static useImperialUnits: boolean = true;
  public static rawSensorData = {};

  //Maps
  location = [{name: "Latitude", value: "Obtaining Location..."}, {name: "Longitude", value: "Obtaining Location..."}];
  shouldShowMap: boolean = true;
  hasMapLoaded: boolean = false;

  //Recording
  private dataCache = {pids: {}};


  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;
  path: any;
  coords: any;
  positionWatch: any;

  constructor(public navCtrl: NavController, private storage: Storage, public alertCtrl: AlertController, public menuCtrl: MenuController, private zone: NgZone) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    if(Network.type === "none" || Network.type === "unknown"){
      this.shouldShowMap = false;
    }
  }

  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);
    this.setupPids();
    this.setupPositionWatch(); 

    this.dataCache["date"] = new Date().toLocaleDateString();
    this.dataCache["startTime"] = new Date().getHours() + ":" + new Date().getMinutes();
  }

  ionViewDidLeave(){
    this.endPage();
  }

  endPage(){
    clearInterval(TripPage.timer);
    this.positionWatch.unsubscribe();
    BackgroundMode.disable();
    this.menuCtrl.swipeEnable(true);
  }

  setupPids(){
    this.storage.ready().then(() => {
      this.storage.get("vehicle").then(info => {
        if(info != null){
          this.primaryFuel = JSON.parse(info).primaryFuel;
          this.pushSensor("010C", "GENERAL", "Engine RPM", (data, isImperial) => {
            return [data / 4, "rpm"];
          }, true, 2);
          this.pushSensor("0110", "ENGINE", "Mass Air Flow", (data, isImperial) => {
            return [data / 100, "g/sec"];
          }, true, 3);
          this.pushSensor("010D", "GENERAL", "Vehicle Speed", (data, isImperial) => {
            //Data input is in km/h
            if(isImperial){
              return [(data / 1.609344).toFixed(2), "mph"];
            }else{
              return [data, "km/h"];
            }
          }, true, 3);
          this.pushSensor("0105", "ENGINE", "Engine Coolant Temperature", (data, isImperial) => {
            if(isImperial){
              return [(data * 1.8 + 32).toFixed(2), "°F"];
            }else{
              return [data, "°C"];
            }
          }, true);
          this.pushSensor("0111", "ENGINE", "Throttle Position", (data, isImperial) => {
            return [data, "%"];
          }, true);
          this.pushSensor("_MPG", "GENERAL", "Fuel Economy", (data, isImperial) => {
              let densityOfFuel = 6.17;
              let afRatio = 14.7;
              //Check for diesel
              let fuelName = this.primaryFuel.name;
              if(fuelName.indexOf("Diesel") >= 0){
                densityOfFuel = 6.943;
                afRatio = 14.5;
              }
              let mpg = "0.00";
              let maf = TripPage.rawSensorData["0110"];
              let speed = TripPage.rawSensorData["010D"];

              if(maf != null && speed != null){
                mpg = ((afRatio * densityOfFuel * 4.54 * speed * 0.621371) / (3600 * maf / 100)).toFixed(2);
              }
            return [mpg, "mpg"];
          }, false, 3);

          TripPage.timer = setInterval(() => {
            let queue = [];
            for(let times = 1; times <= 3; times++){
              for(let i = 0 ; i < this.sensors.length; i++){
                  if(this.sensors[i].priority >= times){
                    queue.push(this.sensors[i]);
                  }
              }
            }
            console.log("Input queue length: " + queue.length);
            BLE.isConnected(Bluetooth.uuid).then(() => {
              for(let i = 0 ; i < queue.length; i++){
                this.update(queue[i]);
              }
            }).catch(err => {
              HomePage.bleError(this.navCtrl, this.storage, err);
            });
          }, Bluetooth.interval * 10 + 100); //Assume 5 sensors, 5 priority, so 10*interval
        }else{
          console.log("No vehicle selected");
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: 'You need to select a vehicle before using this page',
            buttons: ['OK']
          });
          alert.present();
          this.navCtrl.setRoot(HomePage);
          return;
        }
      });
    });
  }


  pushSensor(pid: string, category: string, name: string, updateFunction: any, isPhysical: boolean, priority?: number){
    //Push all the sensors into the array
    if(priority == null || priority == 0){
      priority = 1;
    }
    console.log("Pushing priority: " + priority + " for PID: " + name);
    let sensor = {name: name, value: "No Data", category: category, updateFunction: updateFunction, isPhysical: isPhysical, pid: pid, priority: priority};
    if(isPhysical){
      Bluetooth.writeToUUID(pid + "\r").then(data => {
        if(!data.includes("NO_DATA")){
          this.sensors.push(sensor);
          this.updateWithData(sensor, data);
        }else{
          console.log("Car gave back NO_DATA response for: " + pid);
        }
      }).catch(err => {
        console.log("PID does not exist: " + pid + " or engine is not on");
      });
    }else{
      this.sensors.push(sensor);
    }
    TripPage.rawSensorData[pid] = null;
  }


  update(sensor: any){
    if(sensor.isPhysical){
      BLE.isConnected(Bluetooth.uuid).then(() => {
        Bluetooth.writeToUUID(sensor.pid + "\r").then(data => {
          if(!data.includes("NO_DATA")){
            this.updateWithData(sensor, data);
          }
        });
      }).catch(err => {
        HomePage.bleError(this.navCtrl, this.storage, err);
      });
    }else{
      let value = sensor.updateFunction(null, TripPage.useImperialUnits);
      sensor.value = value[0] + value[1];
    }
  }

  updateWithData(sensor: any, data: any){
    let numericalValue = parseInt(data.substring(6).replace(" ", "").trim(), 16);
    TripPage.rawSensorData[sensor.pid] = numericalValue;
    let value = sensor.updateFunction(numericalValue, TripPage.useImperialUnits);
    sensor.value = value[0] + value[1]; //Concatenate the unit and the value

    if(this.dataCache["pids"][sensor.pid] == null){
      this.dataCache["pids"][sensor.pid] = {timestamp: [], data: [], unit: "", name: ""}
    }
    this.dataCache["pids"][sensor.pid].timestamp.push(Date.now());
    this.dataCache["pids"][sensor.pid].data.push(value[0]);
    this.dataCache["pids"][sensor.pid].unit = value[1];
    this.dataCache["pids"][sensor.pid].name = sensor.name;
    this.dataCache["pids"][sensor.pid].pid = sensor.pid;

    this.zone.run(() => {});
  }


  setupPositionWatch(){
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
    this.endPage();
    this.storage.ready().then(() => {
      this.storage.get("trips").then(data => {
        let array = [];
        if(data != null){
          array = JSON.parse(data).trips;
        }
        this.dataCache["endTime"] = new Date().getHours() + ":" + new Date().getMinutes();
        this.dataCache["id"] = Date.now();
        array.push(this.dataCache);
        console.log(JSON.stringify(this.dataCache));
        this.storage.set("trips", JSON.stringify({trips: array})).then(() => {
          Trips.loadFromStorage(this.storage).then(() => {
            this.navCtrl.setRoot(HomePage);
          });
        });
      });
    });
  }
}