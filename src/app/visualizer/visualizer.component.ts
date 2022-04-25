import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { DataPoint } from '../datapoint';
//import { series } from '../series';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
  startDate: Date = new Date('05 October 2021 00:00 UTC');
  endDate: Date = new Date('15 October 2021 00:00 UTC');

  constructor(private dataService: DataService) { }

  chartData : any;

  
  ngOnInit() {

    this.filteredCountries = this.control.valueChanges.pipe(startWith(''), map(value => this._filter(value)))
    //console.log(this.dataService.getData().subscribe(result => console.log(JSON.stringify(result))));
    //this.chartData = series;
    // return this.dataService.getData(this.country, this.startDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => console.log(JSON.parse(data)));
    // return this.dataService.getData(this.country, this.startDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = JSON.parse(data)[0].confirmed);
    //this.dataService.getData(this.country, this.startDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = this.loadChartData(JSON.parse(data), this.selector));
    this.loadChart();
  }

  loadChart(){
    this.dataService.getData(this.country, this.startDate.toISOString(), this.endDate.toISOString()).subscribe((data: string) => this.chartData = this.loadChartData(JSON.parse(data), this.selector));
  }
  // extract JSON data from the stream into a data object
  loadChartData(jsonData: Object, selector: string) {
    /*
    let series = [
      {
          "name": "cases",
          "series":this.addCases(jsonData)
      },
      {
          "name": "deaths",
          "series":this.addDeaths(jsonData)
      }
    ];
    */

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
    
    //series["cases"] = [];
    //series["deaths"] = [];
/*
    Object.values(jsonData).forEach((value: Object) => {
      
      //this.chartData.push(new DataPoint(value["date"], value["confirmed"], value["deaths"]));
      //console.log(value["confirmed"]);
      let date: Date = new Date(value["date"])
      series["cases"].push({"name": date, "value": value["confirmed_daily"]});
      series["deaths"].push({"name": date, "value": value["deaths_daily"]});
      
    }
    
    );
    */

    /*
    for (const [index, [, value]] of Object.entries(Object.entries(jsonData))) {
      
      series["cases"][index] = {"name": value.date, "value": value.confirmed_daily};
      series["deaths"][index] = {"name": value.date, "value": value.deaths_daily};

    }
    console.log(series);
    */

    //return series;
    //this.chartData = this.series;
    //console.log(this.chartData);
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

  displayFn(subject) {
    console.log(subject)
    return subject ? subject.name : undefined
  }

}
