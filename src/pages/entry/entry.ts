import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading} from 'ionic-angular';
import { BLE } from 'ionic-native';
import { HomePage } from '../home/home';
import { Bluetooth } from '../../app/services/ble'

@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  devices = [];
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {}

  ionViewDidLoad() {
    this.scan();
  }

  scan() : void{
    this.devices = []

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
      let name = device.name;
      if(name === "Carista" || name === "FREEMATICS_ONE"){
        Bluetooth.uuid = device.id;
        Bluetooth.device = device;
        BLE.connect(Bluetooth.uuid).subscribe(() => {
          this.navCtrl.setRoot(HomePage);
          this.loading.dismiss();
        });
      }
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Scanning...'
    });
    this.loading.present();
  }

}
