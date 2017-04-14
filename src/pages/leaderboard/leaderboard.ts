import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html'
})
export class LeaderboardPage {

  credentials = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public alertCtrl: AlertController) {
    storage.get("leaderboard").then(data => {
      if(data == null){
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: "You must join a leaderboard to use this page. Join one on the home page.",
          buttons: ['OK']
        });
        alert.present();
        navCtrl.setRoot(HomePage);
      }else{
        this.credentials = JSON.parse(data);
      }
    });
  }


  uploadData(){
    

  }



}
