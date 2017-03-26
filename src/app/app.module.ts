import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PidPage } from '../pages/pid/pid';
import { EntryPage } from '../pages/entry/entry';
import { TripsPage } from '../pages/trips/trips';
import { StartTripPage } from '../pages/start-trip/start-trip';

import { Storage } from '@ionic/storage';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PidPage,
    EntryPage,
    TripsPage,
    StartTripPage
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
    StartTripPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage]
})
export class AppModule {}
