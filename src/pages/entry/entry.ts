import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, MenuController } from 'ionic-angular';
import { BLE } from 'ionic-native';
import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble'
import { Storage } from '@ionic/storage';

import { CarData } from '../../app/services/cardata';


@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  devices = [];
  loading: Loading;

  constructor(public navCtrl: NavController, public menuCtrl: MenuController, public navParams: NavParams, private alertCtrl: AlertController, private loadingCtrl: LoadingController, private storage: Storage) {}

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
    console.log(CarData.carData["2017"]["Jeep"]["New Compass 4WD"]["Manual 6-spd"]["primaryFuel"]["name"])
    this.scan();
  }

  scan() : void{
    this.storage.ready().then(() => {
        this.storage.get('uuid').then((uuid) => {
          if(uuid != null){
            this.storage.get('name').then((name) => {
              console.log("Attempted to disconnect at scan()");
              BLE.disconnect(uuid).then(() => {
                this.triggerScan();
              }).catch(() => {
                this.triggerScan();
              });
            });
          }else{
            this.triggerScan();
          }
       });
    });
  }

  triggerScan(){
    this.devices = []
    this.scanAndPush();
  }

  scanAndPush(){
    console.log("Scanning has started");
    this.showLoading()
    BLE.startScan([]).subscribe(device => {
      this.devices.push(device);
      this.connect(device);
    });

    setTimeout(() => {
      BLE.stopScan().then(() => {
        this.loading.dismiss();
        console.log("Scanning has stopped");
        console.log(JSON.stringify(this.devices))
      });
    }, 3000);
  }


  connect(device: any) : void{
    let name = device.name;
    if(name === "Carista" || name === "FREEMATICS_ONE"){
      console.log("Attempt to connect to device: " + JSON.stringify(device));
      BLE.connect(device.id).subscribe(() => {
        this.pushToHome(device);
        this.loading.dismiss();
      }, (err) => {
        this.loading.dismiss();
        console.log("Connection error: " + JSON.stringify(err));
      });
    }
  }

  pushToHome(device: any){
    Bluetooth.uuid = device.id;
    Bluetooth.device = device;
    this.storage.ready().then(() => {
       this.storage.set('uuid', device.id);
       this.storage.set('name', device.name);
       this.navCtrl.setRoot(HomePage);
    });
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Scanning...'
    });
    this.loading.present();
  }

}
