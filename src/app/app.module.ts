import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PidPage } from '../pages/pid/pid';
import { EntryPage } from '../pages/entry/entry';
import { TripsPage } from '../pages/trips/trips';
import { TripPage } from '../pages/trip/trip';
import { VehicleSelectPage } from '../pages/vehicle-select/vehicle-select';
import { Storage } from '@ionic/storage';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PidPage,
    EntryPage,
    TripsPage,
    VehicleSelectPage,
    TripPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PidPage,
    EntryPage,
    TripsPage,
    VehicleSelectPage,
    TripPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage]
})
export class AppModule {}
