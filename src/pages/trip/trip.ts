import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';

import { Storage } from '@ionic/storage';
import { NavController, AlertController, MenuController } from 'ionic-angular';
import { BLE, BackgroundMode, Network, Geolocation } from 'ionic-native';

import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble';

declare var google;

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

  constructor(public navCtrl: NavController, private storage: Storage, public alertCtrl: AlertController, public menuCtrl: MenuController, private zone: NgZone) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    if(Network.type === "none" || Network.type === "unknown"){
      this.shouldShowMap = false;
    }

    this.setupPids();
  }

  ionViewDidLoad() {
    BackgroundMode.enable();
    this.menuCtrl.swipeEnable(false);
    this.setupPositionWatch(); 
  }

  ionViewDidLeave(){
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
          this.pushSensor("010C", "GENERAL", "Vehicle RPM", (data, isImperial) => {
            return [data / 4, "rpm"];
          }, true);
          this.pushSensor("0110", "ENGINE", "Mass Air Flow", (data, isImperial) => {
            return [data, "g/sec"];
          }, true);
          this.pushSensor("010D", "GENERAL", "Vehicle Speed", (data, isImperial) => {
            //Data input is in km/h
            if(isImperial){
              return [(data / 1.609344).toFixed(2), "mph"];
            }else{
              return [data, "km/h"];
            }
          }, true);
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
            return [-100, "mpg"];
          }, false);
         
          TripPage.timer = setInterval(() => {
            BLE.isConnected(Bluetooth.uuid).then(() => {
              for(let i = 0 ; i < this.sensors.length; i++){
                this.update(this.sensors[i]);
              }
            }).catch(err => {
              HomePage.bleError(this.navCtrl, this.storage, err);
            });
          }, 900);
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

  pushSensor(pid: string, category: string, name: string, updateFunction: any, isPhysical: boolean){
    //Push all the sensors into the array
    let sensor = {name: name, value: "No Data", category: category, updateFunction: updateFunction, isPhysical: isPhysical, pid: pid};
    if(isPhysical){
      Bluetooth.writeToUUID(pid + "\r").then(data => {
        if(!data.includes("NO_DATA")){
          this.sensors.push(sensor);
        }
      }).catch(err => {
        console.log("PID does not exist: " + pid + " or engine is not on");
      });
    }else{
      this.sensors.push(sensor);
    }
  }


  update(sensor: any){
    if(sensor.isPhysical){
      Bluetooth.writeToUUID(sensor.pid + "\r").then(data => {
        if(!data.includes("NO_DATA")){
          let value = sensor.updateFunction(parseInt(data.substring(6).replace(" ", "").trim(), 16), TripPage.useImperialUnits);
          sensor.value = value[0] + value[1]; //Concatenate the unit and the value
          this.zone.run(() => {});
        }
      });
    }else{
      let value = sensor.updateFunction(null, TripPage.useImperialUnits);
      sensor.value = value[0] + value[1];
    }
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
    //TODO Save the trip
    this.navCtrl.setRoot(HomePage);
  }

  

}
