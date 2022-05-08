import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { __values } from 'tslib';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

// a service to get country data in JSON format
export class DataService {
   
  constructor(private http: HttpClient) { }

  getData(Uid: string, minDate: string, maxDate: string){

    return this.http.get<Response>(`https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/global?uid=${Uid}&min_date=${minDate}&max_date=${maxDate}&hide_fields=_id, country, country_code, country_iso2, country_iso3, loc, state`)
    .pipe(map((response : Response) => JSON.stringify(response)));
  }
}
