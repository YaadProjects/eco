import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-trip-detail',
  templateUrl: 'trip-detail.html'
})
export class TripDetailPage {

  trip: any;
  lineChart: any;

  availablePids = [];
  selectedPid: string;

  @ViewChild('lineCanvas') lineCanvas;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.trip = navParams.get("trip");
    for (var key in this.trip.pids) {
        var value = this.trip.pids[key];
        this.availablePids.push({name: value.name, val: value.pid});
        if(key == "010C"){
          this.selectedPid = "010C";
        }
    }
  }

  ionViewDidLoad(){
    this.pidChange();
  }

  pidChange(){
    console.log("Changing to PID: " + this.selectedPid);
    if(this.lineChart != null){
      this.lineChart.destroy();
    }
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.showTooltips = false;
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

}
