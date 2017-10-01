import { BackgroundGeolocation, BackgroundGeolocationResponse, BackgroundGeolocationConfig } from '@ionic-native/background-geolocation';
import { Http } from '@angular/http';
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';

import { Storage } from '@ionic/storage';
import { NavController, AlertController, MenuController } from 'ionic-angular';
import { BLE, Network, Geolocation, Insomnia, BackgroundMode } from 'ionic-native';

import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble';
import { Trips } from "../../app/services/trips";

declare var google;

@Component({
  selector: 'page-trip',
  templateUrl: 'trip.html'
})
export class TripPage {

  //Sensors
  private sensors = [];
  private primaryFuel : any;
  public static useImperialUnits: boolean = true;
  public static rawSensorData = {};
  private static continue: boolean = true;

  //Maps
  shouldShowMap: boolean = true;
  hasMapLoaded: boolean = false;

  //Recording
  private dataCache = {pids: {}};
  private mpgSensor : any;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;
  path: any;
  coords: any;
  backgroundPositionWatch: any;
  foregroundPositionWatch: any;


  constructor(public navCtrl: NavController, private storage: Storage, public alertCtrl: AlertController, public menuCtrl: MenuController, private zone: NgZone, public http: Http, private bgGeolocation: BackgroundGeolocation ) {
    if(!Bluetooth.adapterInit){
      navCtrl.setRoot(HomePage);
      return;
    }

    if(Network.type === "none"){
      this.shouldShowMap = false;
    }

    BackgroundMode.enable();
    TripPage.continue = true;
    this.menuCtrl.swipeEnable(false);
    this.setupPids();
    this.setupPositionWatch(); 

    this.dataCache["date"] = new Date().toLocaleDateString();
    {
      let date = new Date();
      let minute: any = date.getMinutes();
      if(minute < 10){
        minute = "0" + minute;
      }
      this.dataCache["startTime"] = date.getHours() + ":" + minute;
    }

    Insomnia.keepAwake().then(
      () => console.log('Keep awake success'),
      () => console.log('Keep awake error')
    );
  }

  endPage(){
    TripPage.continue = false;
    this.backgroundPositionWatch.unsubscribe();
    this.foregroundPositionWatch.unsubscribe();
    this.bgGeolocation.finish(); // FOR IOS ONLY
    this.bgGeolocation.stop();
    this.menuCtrl.swipeEnable(true);

    BackgroundMode.disable();
    Insomnia.allowSleepAgain().then(
      () => console.log('Allow sleep success'),
      () => console.log('Allow sleep error')
    );
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
              if(isImperial){
                speed = speed / 1.609344;
              }
              maf = maf / 100;
              console.log("MAF: " + maf + " and speed is: " + speed + " km/h");

              if(maf != null && speed != null && maf != 0){
                mpg = ((afRatio * densityOfFuel * 4.54 * speed * 0.621371) / (3600 * maf / 100)).toFixed(2);
              }
            return [mpg, "mpg"];
          }, false, 1);
          this.updateFunction(this);
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

  updateFunction(this_: TripPage) : void {
    let queue = [];
    for(let times = 1; times <= 3; times++){
      for(let i = 0 ; i < this_.sensors.length; i++){
          if(this_.sensors[i].priority >= times){
            queue.push(this_.sensors[i]);
          }
      }
    }
    console.log("Input queue length: " + queue.length);
    BLE.isConnected(Bluetooth.uuid).then(() => {
      for(let i = 0 ; i < queue.length; i++){
        this_.update(queue[i]);
      }
    }).catch(err => {
      HomePage.bleError(this_.navCtrl, this_.storage, err);
    });
    
    if(TripPage.continue){
      setTimeout(this_.updateFunction, Bluetooth.interval * 10 + 100, this_);
    }
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
          console.log("Sensor pushed: " + pid);
          this.sensors.push(sensor);
          this.updateWithData(sensor, data);
        }else{
          console.log("Car gave back NO_DATA response for: " + pid);
        }
      }).catch(err => {
        console.log("PID does not exist: " + pid + " or engine is not on");
      });
    }else{
      if(sensor.pid === "_MPG"){
        this.mpgSensor = sensor;
      }
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
      this.logData(sensor, value);
    }
  }

  updateWithData(sensor: any, data: any){
    let numericalValue = parseInt(data.substring(6).replace(" ", "").trim(), 16);
    TripPage.rawSensorData[sensor.pid] = numericalValue;
    let value = sensor.updateFunction(numericalValue, TripPage.useImperialUnits);
    sensor.value = value[0] + value[1]; //Concatenate the unit and the value
    this.logData(sensor, value);
    this.update(this.mpgSensor);
    this.zone.run(() => {});
  }

  logData(sensor: any, value: any){
    if(this.dataCache["pids"][sensor.pid] == null){
      this.dataCache["pids"][sensor.pid] = {timestamp: [], data: [], unit: "", name: ""}
    }
    this.dataCache["pids"][sensor.pid].timestamp.push(Date.now());
    this.dataCache["pids"][sensor.pid].data.push(value[0]);
    this.dataCache["pids"][sensor.pid].unit = value[1];
    this.dataCache["pids"][sensor.pid].name = sensor.name;
    this.dataCache["pids"][sensor.pid].pid = sensor.pid;
  }


  startLat: any;
  setupPositionWatch(){
    this.coords = [];
    const config: BackgroundGeolocationConfig = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: false, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };
    this.backgroundPositionWatch = this.bgGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
        if(location.accuracy < 100){
          let positionArray = {lat: location.latitude, lng: location.longitude};
          this.coords.push(positionArray);
        }
        console.log("Background Location: " + location.latitude + ' ' + location.longitude + ' accuracy: ' + location.accuracy);
    });
    this.bgGeolocation.start();

    let options = {
      enableHighAccuracy: true
    }
    this.foregroundPositionWatch = Geolocation.watchPosition(options).subscribe(position => {
      if(position.coords !== undefined){
        if(position.coords.accuracy < 100){
          let positionArray = {lat: position.coords.latitude, lng: position.coords.longitude};
          this.coords.push(positionArray);
          if(this.startLat == null){
            this.startLat = positionArray;
          }
          if(this.shouldShowMap){
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            if(!this.hasMapLoaded){
              this.loadMap(latLng);
            }
            this.marker.setPosition(latLng);
            this.map.setCenter(latLng);  
            this.path.setPath(this.coords);
          }
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
        {
          let date = new Date();
          let minute: any = date.getMinutes();
          if(minute < 10){
            minute = "0" + minute;
          }
          this.dataCache["endTime"] = date.getHours() + ":" + minute;
        }
        this.dataCache["id"] = Date.now();

        if(this.shouldShowMap && this.path != null){
          this.dataCache["distance"] = Number(this.path.inKm()).toFixed(2);
        }
        this.dataCache["positions"] = this.coords;
        this.dataCache["startPos"] = this.startLat;
        this.dataCache["car"] = this.primaryFuel;
        this.dataCache["isImperial"] = TripPage.useImperialUnits;

        array.push(this.dataCache);
        console.log(JSON.stringify(this.dataCache));
        this.storage.set("trips", JSON.stringify({trips: array})).then(() => {
          Trips.loadFromStorage(this.storage).then(() => {
            if(this.shouldShowMap){
              let link = 'http://ssh.yolandtech.tk:8080/eco-server/api/calculate';
              let data = JSON.stringify(this.dataCache);
              
              this.http.post(link, data).subscribe(data => {
                let trip = this.dataCache;
                trip["analysis"] = JSON.parse(data.text());
                trip["analysis"]["idleCostLost"] = new Number(trip["analysis"]["idleCostLost"]).toFixed(2);
                Trips.update(trip);
                Trips.storeToStorage(this.storage).then(() => {
                  this.storage.get("tokens").then(data => {
                    let output = "";
                    if(data != null){
                      output = data;
                      output += ("," + trip["analysis"]["token"]);
                    }else{
                      output = this["analysis"]["token"];
                    }
                    this.storage.set("tokens", output);
                  });
                });
              });
            }
            this.navCtrl.setRoot(HomePage);
          });
        });
      });
    });
  }
}