import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading} from 'ionic-angular';
import { BLE } from 'ionic-native';
import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble'
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  devices = [];
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private loadingCtrl: LoadingController, private storage: Storage) {}

  ionViewDidLoad() {
    this.scan();
  }

  scan() : void{
    this.storage.ready().then(() => {
        this.storage.get('uuid').then((uuid) => {
          if(uuid != null){
            this.storage.get('name').then((name) => {
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
      this.connect(device)
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
    console.log("Attempt to connect to device: " + JSON.stringify(device));

    let name = device.name;
    if(name === "Carista" || name === "FREEMATICS_ONE"){
      BLE.connect(device.id).subscribe(() => {
        this.pushToHome(device);
        this.loading.dismiss();
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
