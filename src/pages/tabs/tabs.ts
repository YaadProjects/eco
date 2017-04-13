import { Component } from '@angular/core';

import { TripsPage } from '../trips/trips';
import { HomePage } from '../home/home';
// import { ContactPage } from '../contact/contact';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = TripsPage;
//   tab3Root = ContactPage;

  constructor() {

  }
}