import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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

  // form control and autocomplete elements
  control = new FormControl();
  filteredCountries: Observable<string[]>;
  
  // shape of the curve
  curve = shape.curveMonotoneX;

  // this will feed into the chart
  chartData : any;
  averageData :any;

  constructor(private dataService: DataService) { }

  
  ngOnInit() {
    this.filteredCountries = this.control.valueChanges.pipe(startWith(''), map(value => this._filter(value)))

    this.loadChart();
  }

  // gets the API data into the ngx-chart
  loadChart(){

    let countryUid = countriesJ[this.country];

    this.dataService.getData(countryUid, this.maxDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = this.loadChartData(JSON.parse(data), this.selector));
  }

  // extracts JSON data from the stream into a data object
  loadChartData(jsonData: Object, selector: string) {
      return [
        {
            "name": selector,
            "series":this.addData(jsonData, selector)
        }
      ];
  }

  // method to turn JSON data to multi-series
  addData(jsonData: Object, selector: string) {
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
  loadChartIfCorrect(){
    if (Object.keys(countriesJ).includes(this.country)){
      this.loadChart()
    }
  }

  // formatting for the slider label
  formatSliderLabel(value: number) {
    if (value < 30) {
      return value + 'd';
    } else if (value >= 30){
      return Math.floor(value/30) + 'm';
    }
    return value;
  }


  // sets start date for the chart
  setStartDate(){
    this.startDate = new Date(new Date().setDate(this.endDate.getDate() - this.chartPeriod));
    this.loadChartIfCorrect();
  }

  // format chart date to date string
  chartDateFormatting(val:number) {
    return new Date(val).toLocaleString('sv').substring(0,10);
  }

}
