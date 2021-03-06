import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as shape from 'd3-shape';
import { countriesJ } from '../countriesJ';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  providers: [DataService]
})
export class VisualizerComponent implements OnInit {
  
  // initial data specifications
  selector: string = 'cases';
  country:  string = 'Germany';
  startDate: Date = new Date('01 January 2022 00:00 UTC');
  endDate: Date = new Date();
  maxDate: Date = new Date("2020-01-22");
  maxPeriod: number = Math.floor((this.endDate.getTime() - this.maxDate.getTime()) / (1000 * 3600 * 24));
  chartPeriod: number;
  yScaleMax : number;

  // form control and autocomplete elements
  control = new FormControl();
  filteredCountries: Observable<string[]>;
  
  // shape and color of the curves
  curve = shape.curveMonotoneX;
  colorScheme = {
      domain: [
        '#85C1E9', 
        '#BF1919'
      ]
    };

  // this will feed into the chart
  chartData = [];
  averageData = [];
 
  constructor(private dataService: DataService) { }

  
  ngOnInit() {
    this.filteredCountries = this.control.valueChanges.pipe(startWith(''), map(value => this._filter(value)))

    this.loadChart();
  }

  // gets the API data
  loadChart(){

    let countryUid = countriesJ[this.country];

    if (this.countryNotValid() === false) {
      this.dataService.getData(countryUid, this.maxDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = this.loadChartData(JSON.parse(data), this.selector), err => console.error('Error: ' + err));
    }

    
  }

  // extracts JSON data from the stream into a data object
  loadChartData(jsonData: Object, selector: string) {
      return [
        {
            "name": selector,
            "series":this.addData(jsonData, selector)
        },
        {
            "name": selector + " (7-day rolling average)",
            "series":this.addData(jsonData, selector, true)
        }
      ];
  }

  // method to turn JSON data to multi-series
  addData(jsonData: Object, selector: string, average?: boolean) {
    let data = [];
    let param : string;

    if (selector === "cases") {
      param = "confirmed_daily"
    } else if (selector === "deaths")  {
      param = "deaths_daily"
    } else {
      console.warn("Invalid selector")
      return
    }


    for (const [, [, value]] of Object.entries(Object.entries(jsonData))) {
      
      data.push({"name": new Date(value.date).getTime(), "value": value[param]});

    }

    // get moving average
    if (average) {
    let averageData = this.simpleMovingAverage(data);

    return averageData;
    }

    return data;
  }

  /*
  Filter function, based on sample
  link: https://github.com/gopinav/Angular-Material-Tutorial/tree/master/material-demo/src/app/autocomplete
  */
  _filter(value: string) : string[] {
    const filterValue = value.toLowerCase();
    return Object.keys(countriesJ).filter(country => country.toLowerCase().startsWith(filterValue))
  }

  // simple method to save server resources: only load chart if input is correct
  countryNotValid(){
    if (Object.keys(countriesJ).includes(this.country)){
      return false;
    } else {
      return true;
    }
  }

  // sets start date for the chart
  setStartDate(){
    this.startDate = new Date(new Date().setDate(this.endDate.getDate() - this.chartPeriod));
    //this.loadChartIfCorrect();
  }

  // format chart date to date string
  chartDateFormatting(val:number) {
    return new Date(val).toLocaleString('sv').substring(0,10);
  }

  // a function calculating simple moving average given an array of Objects
  // modified from source: https://blog.oliverjumpertz.dev/the-moving-average-simple-and-exponential-theory-math-and-implementation-in-javascript
  simpleMovingAverage(data: any, window = 7) {
    if (!data || data.length < window) {
      return [];
    }
  
    let index = window - 1;
    const length = data.length + 1;
  
    let simpleMovingAverages = new Array();
  
    while (++index < length) {
      const windowSlice = data.slice(index - window, index);
      const valueSlice = windowSlice.map(a => a.value);
      
      const sum = valueSlice.reduce((prev, curr) => prev + curr, 0);

      let input = JSON.parse(JSON.stringify(data[Object.keys(data)[index - 1]]));
      
      input.value = sum / window;
      
      simpleMovingAverages.push(input);
    }
    return simpleMovingAverages;
  }

  // calculates the max value for the y axis based on array values in selected period
  getYScaleMax() {
    if (this.chartData.length > 0){
      let values = this.chartData[0].series.map(a => a.value).slice(-this.chartPeriod);
      this.yScaleMax = Math.max(...values);
    }

    return this.yScaleMax;
  }
  
}