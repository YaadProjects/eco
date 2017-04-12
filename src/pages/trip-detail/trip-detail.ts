import { Network } from 'ionic-native';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.trip = navParams.get("trip");
    for (var key in this.trip.pids) {
        var value = this.trip.pids[key];
        this.availablePids.push({name: value.name, val: value.pid});
        if(key == "010C"){
          this.selectedPid = "010C";
        }
    }

    if(Network.type === "none" || Network.type === "unknown"){
      this.shouldShowMap = false;
    }
  }

  ionViewDidLoad(){
    this.pidChange();
    this.loadMap();
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

}
