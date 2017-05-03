import { Http } from '@angular/http';
import { Network } from 'ionic-native';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { Storage } from '@ionic/storage';
import { Trips } from "../../app/services/trips";
import { DriveBetterPage } from '../drive-better/drive-better';

declare var google;

@Component({
  selector: 'page-trip-detail',
  templateUrl: 'trip-detail.html'
})
export class TripDetailPage {

  trip: any;
  lineChart: any;
  shouldShowMap: boolean = true;

  availablePids = [];
  selectedPid: string;

  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  path: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public http: Http, public storage: Storage, public modalCtrl: ModalController) {
    this.trip = navParams.get("trip");
    for (var key in this.trip.pids) {
        var value = this.trip.pids[key];
        this.availablePids.push({name: value.name, val: value.pid});
        if(key == "010C"){
          this.selectedPid = "010C";
        }
    }
    if(Network.type === "none"){
      this.shouldShowMap = false;
    }else{
      if(this.trip.analysis == null){
        let link = 'http://ssh.yolandtech.tk:8080/eco-server/api/calculate';
        let data = JSON.stringify(this.trip);
        
        this.http.post(link, data).subscribe(data => {
          this.trip.analysis = JSON.parse(data.text());
          this.trip.analysis.idleCostLost = new Number(this.trip.analysis.idleCostLost).toFixed(2);
          Trips.update(this.trip);
          Trips.storeToStorage(this.storage).then(() => {
            this.storage.get("tokens").then(data => {
              let output = "";
              if(data != null){
                output = data;
                output += ("," + this.trip.analysis.token);
              }else{
                output = this.trip.analysis.token;
              }
              this.storage.set("tokens", output);
            });
          });
        }, error => {
          console.log("The analysis did not sucessfully load!");
          let alert = this.alertCtrl.create({
            title: 'Warning!',
            subTitle: 'The trip analysis was not successfully obtained. Restart the app and try again.',
            buttons: ['OK']
          });
          alert.present();
        });
      }
    }
  }

  ionViewDidLoad(){
    this.pidChange();
    this.loadMap();

    if(!this.shouldShowMap){
      if(this.trip.analysis == null){
        let alert = this.alertCtrl.create({
          title: 'Warning!',
          subTitle: 'The trip analysis will not be availble while the phone is offline',
          buttons: ['OK']
        });
        alert.present();
      }
    }
  }

  pidChange(){
    console.log("Changing to PID: " + this.selectedPid);
    if(this.lineChart != null){
      this.lineChart.destroy();
    }
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.tooltips.enabled = false;
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: this.trip.pids[this.selectedPid].timestamp,
          datasets: [{
            label: this.trip.pids[this.selectedPid].name,
            data: this.trip.pids[this.selectedPid].data,
          }]
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                displayFormats: {
                  'millisecond': 'HH:mm',
                  'second': 'HH:mm',
                  'minute': 'HH:mm',
                  'hour': 'HH:mm',
                  'day': 'HH:mm',
                  'week': 'HH:mm',
                  'month': 'HH:mm',
                  'quarter': 'HH:mm',
                  'year': 'HH:mm',
                },
              }
            }],
          },
          elements: { point: { radius: 0 } }
        }
    });
  }

  loadMap(){
    let mapOptions = {
      center: new google.maps.LatLng(this.trip.startPos.lat, this.trip.startPos.lng),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      streetViewControl: false
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.path = new google.maps.Polyline({
      path: this.trip.positions,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.path.setMap(this.map);
  }

  driveBetter(){
    let modal = this.modalCtrl.create(DriveBetterPage);
    modal.present();
  }

}
