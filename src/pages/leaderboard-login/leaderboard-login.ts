import { Http, RequestOptions, Headers } from '@angular/http';
import { Component } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from "../home/home";

@Component({
  selector: 'page-leaderboard-login',
  templateUrl: 'leaderboard-login.html'
})
export class LeaderboardLoginPage {
  
  credentials = {};

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public storage: Storage, public http: Http, public alertCtrl: AlertController) {}

  login(){
    let link = 'http://ssh.yolandtech.tk:8080/eco-server/api/joinBoard';
    let headers = new Headers({
			'Content-Type': 'application/x-www-form-urlencoded'
		});
		let options = new RequestOptions({
			headers: headers
		});
		let body = 'boardId=' + encodeURIComponent(this.credentials["boardId"]) + '&password=' + encodeURIComponent(this.credentials["password"]) + '&name=' + encodeURIComponent(this.credentials["name"]);
    this.http.post(link, body, options).subscribe(data => {
      let message = JSON.parse(data.text());
      if(message.id == null){
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: message.message,
          buttons: ['OK']
        });
        alert.present();
      }else{
        this.credentials["id"] = message.id;
        this.storage.set("leaderboard", JSON.stringify(this.credentials)).then(() => {
          this.navCtrl.setRoot(HomePage); //For now
        });
      }
    }, error => {
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Could not join leaderboard',
        buttons: ['OK']
      });
      alert.present();
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
