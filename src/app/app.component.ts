import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { CarData } from './services/cardata'

import { HomePage } from '../pages/home/home';
import { EntryPage } from '../pages/entry/entry';
import { TripsPage } from '../pages/trips/trips';
import { LeaderboardPage } from "../pages/leaderboard/leaderboard";
import { Trips } from "./services/trips";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = EntryPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public storage: Storage, public http: Http) {
    this.http.get("data/vehicles.json").subscribe(data => {
        CarData.carData = data.json();
        this.storage.ready().then(() => {
          Trips.loadFromStorage(this.storage).then(() => {
          console.log("Trips loaded"); 

          this.initializeApp();
          // used for an example of ngFor and navigation
          this.pages = [
            { title: 'Home', component: HomePage },
            { title: 'Trips', component: TripsPage },
            { title: 'Leaderboard', component: LeaderboardPage }
          ];
        });
      });
    });
      
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
