import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { PidPage } from '../pages/pid/pid';
import { EntryPage } from '../pages/entry/entry';
import { TripsPage } from '../pages/trips/trips';
import { TripPage } from '../pages/trip/trip';
import { TripDetailPage } from '../pages/trip-detail/trip-detail';
import { VehicleSelectPage } from '../pages/vehicle-select/vehicle-select';

@NgModule({
  declarations: [
    MyApp,
    EntryPage,
    HomePage,
    PidPage,
    TripsPage,
    TripPage,
    TripDetailPage,
    VehicleSelectPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EntryPage,
    HomePage,
    PidPage,
    TripsPage,
    TripPage,
    TripDetailPage,
    VehicleSelectPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
