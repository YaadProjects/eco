import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { HomePage } from '../pages/home/home';
import { PidPage } from '../pages/pid/pid';
import { EntryPage } from '../pages/entry/entry';
import { Http } from '@angular/http';
import { CarData } from './services/cardata'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = EntryPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public http: Http) {
    this.http.get("data/vehicles.json").subscribe(data => {
      CarData.carData = data.json();

      this.initializeApp();
      // used for an example of ngFor and navigation
      this.pages = [
        { title: 'Home', component: HomePage },
        { title: 'Sensors', component: PidPage }
      ];
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
