import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  providers: [DataService]
})
export class VisualizerComponent implements OnInit {

  //An array containing all the country names in the world
  countries: string[] = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

  
  // form control and autocomplete elements
  control = new FormControl();
  filteredCountries: Observable<string[]>;
  

  // initial data specifications
  selector: string = 'cases';
  country:  string = 'Germany';
  startDate: Date = new Date('01 January 2022 00:00 UTC');
  endDate: Date = new Date();
  maxDate: Date = new Date("2020-01-22");
  maxPeriod: number = Math.floor((this.endDate.getTime() - this.maxDate.getTime()) / (1000 * 3600 * 24));
  chartPeriod: number;

  // shape of the curve
  curve = shape.curveBasis;

  chartData : any;

  constructor(private dataService: DataService) { }

  
  ngOnInit() {
    
    this.filteredCountries = this.control.valueChanges.pipe(startWith(''), map(value => this._filter(value)))

    this.loadChart();
  }

  // gets the API data into the ngx-chart
  loadChart(){
    this.dataService.getData(this.country, this.startDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = this.loadChartData(JSON.parse(data), this.selector));
  }

  // extracts JSON data from the stream into a data object
  loadChartData(jsonData: Object, selector: string) {

    if (selector ==='cases') {
      return [
        {
            "name": "cases",
            "series":this.addCases(jsonData)
        }
      ];
    } else if (selector ==='deaths') {
      return [
        {
            "name": "cases",
            "series":this.addDeaths(jsonData)
        }
      ];
    }
    
  }

  addCases(jsonData: Object){
    let cases = [];
    for (const [index, [, value]] of Object.entries(Object.entries(jsonData))) {
      
      cases.push({"name": value.date, "value": value.confirmed_daily});

    }
    return cases;
  }
  
  addDeaths(jsonData: Object){
    let deaths = [];
    for (const [index, [, value]] of Object.entries(Object.entries(jsonData))) {
      
      deaths.push({"name": value.date, "value": value.deaths_daily});

    }
    return deaths;
  }

  // Filter function, based on Codevolution sample
  _filter(value: string) : string[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.toLowerCase().startsWith(filterValue))
  }

  // simple method to save server resources: only load chart if input is correct
  loadChartIfCorrect(){
    if (this.countries.includes(this.country)){
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
    this.loadChart();
  }

  // format chart date to date string
  chartDateFormatting(val:Date) {
    return val.toString().substring(0,10);
  }

}
