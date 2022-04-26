import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { __values } from 'tslib';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

// a service to get country data in JSON format
export class DataService {
   
  constructor(private http: HttpClient) { }

  getData(country: string, minDate: string, maxDate: string){

    return this.http.get<Response>(`https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/countries_summary?country=${country}&min_date=${minDate}&max_date=${maxDate}`)
    .pipe(map((response : Response) => JSON.stringify(response)));
  }
}
