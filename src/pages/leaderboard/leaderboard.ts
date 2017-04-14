import { RequestOptions, Headers, Http } from '@angular/http';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public alertCtrl: AlertController, public http: Http) {
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

  exitLeaderboard(){
    let alert = this.alertCtrl.create({
      title: 'Leave?',
      message: 'Confirm you want to leave this leaderboard?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Leave',
          handler: () => {
            this.storage.set("leaderboard", null).then(() => {
              this.navCtrl.setRoot(HomePage);
            });
          }
        }
      ]
    });
    alert.present();
  }

  uploadData(){
    let alert = this.alertCtrl.create({
      title: 'Upload',
      message: 'Confirm you want to upload your local trips up to the leaderboard?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Upload',
          handler: () => {
            //Upload all of them
            this.storage.get("tokens").then(data => {
              if(data != null){
                let link = 'http://ssh.yolandtech.tk:8080/eco-server/api/updateBoard';
                let headers = new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded'
                });
                let options = new RequestOptions({
                  headers: headers
                });
                let body = 'boardId=' + encodeURIComponent(this.credentials["boardId"]) + '&password=' + encodeURIComponent(this.credentials["password"]) + '&tokens=' + encodeURIComponent(data)  + '&id=' + encodeURIComponent(this.credentials["id"]);
                console.log("Posting to leaderboard: " + body);
                this.http.post(link, body, options).subscribe(data => {
                  let message = JSON.parse(data.text());
                  let alert = this.alertCtrl.create({
                    title: 'Message',
                    subTitle: message.message,
                    buttons: ['OK']
                  });
                  alert.present();
                }, error => {
                  let alert = this.alertCtrl.create({
                    title: 'Error!',
                    subTitle: 'Could not upload to leaderboard',
                    buttons: ['OK']
                  });
                  alert.present();
                });
              }
            });
          }
        }
      ]
    });
    alert.present();

  }



}
