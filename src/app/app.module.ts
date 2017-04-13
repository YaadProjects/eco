import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { EntryPage } from '../pages/entry/entry';
import { TripsPage } from '../pages/trips/trips';
import { TripPage } from '../pages/trip/trip';
import { TripDetailPage } from '../pages/trip-detail/trip-detail';
import { VehicleSelectPage } from '../pages/vehicle-select/vehicle-select';
import { LeaderboardLoginPage } from '../pages/leaderboard-login/leaderboard-login';
import { TabsPage } from '../pages/tabs/tabs';

@NgModule({
  declarations: [
    MyApp,
    EntryPage,
    HomePage,
    TripsPage,
    TripPage,
    TripDetailPage,
    VehicleSelectPage,
    LeaderboardLoginPage,
    TabsPage
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
    TripsPage,
    TripPage,
    TripDetailPage,
    VehicleSelectPage,
    LeaderboardLoginPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
