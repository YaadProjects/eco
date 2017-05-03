import { Http, RequestOptions, Headers } from '@angular/http';
import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-drive-better',
  templateUrl: 'drive-better.html'
})
export class DriveBetterPage {
  
  constructor(public navCtrl: NavController, public viewCtrl: ViewController) {}
  
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
