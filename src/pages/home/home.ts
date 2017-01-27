import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { CarData, ObdPid } from '../../app/services/cardata';

declare var c3;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  ngOnInit(){
    CarData.addPids();

    let speedPid : ObdPid = CarData.getPid("vehicleSpeed");
    let rpmPid : ObdPid = CarData.getPid("engineRPM");

    let speedChart = this.generateChart("#speed", "mph", [85, 100, 125, 140], 'Vehicle Speed', 180, speedPid);
    let rpmChart = this.generateChart("#rpm", "rpm", [5000, 6000, 7000, 8000], 'RPM', 8000, rpmPid);

    setInterval(function(ref){
      ref.loadData(speedChart, speedPid);
      ref.loadData(rpmChart, rpmPid);
    }, 500, this);
  }


  loadData(chart: any, pid: ObdPid){
    if(pid.isAvailable()){
      chart.load({
          columns: [['data', pid.getData()]]
      });
    }
  }

  generateChart(element: string, unit: string, color_values: any, text: string, max: number, pid: ObdPid){
    if(!pid.isAvailable()){
      return null;
    }
    var chart = c3.generate({
      bindto: element,
      data: {
          columns: [
              ['data', 1]
          ],
          type: 'gauge',
      },
      gauge: {
        label: {
           format: function(value, ratio) {
               return value + " " + unit;
           },
           show: false // to turn off the min/max labels.
       },
        max: max,
      },
      color: {
          pattern: ['#60B044', '#F6C600', '#F97600', '#FF0000'],
          threshold: {
              unit: unit,
              values: color_values
          }
      },
      size: {
          height: 120
      },
      title: {
        text: text
      },
      tooltip: {
        show: false
      }
    });

    return chart;
  }

}
