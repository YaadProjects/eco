import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CarData, ObdPid } from '../../app/services/cardata';

/*
  Generated class for the Pids page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pids',
  templateUrl: 'pids.html'
})
export class PidsPage {

  engineItems = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ngOnInit() {
    CarData.addPids();
    for(var i = 0; i < CarData.pidList.length; i++){
      let pid : ObdPid = CarData.getPid(CarData.pidList[i])
      switch(pid.getType()){
        case "Engine":
          this.engineItems.push(pid);
          break;
      }
    }
  }

  ionViewDidLoad() {

  }

}
