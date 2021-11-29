import { environment } from '../environments/environment.prod';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURL = environment.filesurl

  constructor(private http: HttpClient) { }

  getNetwork(date: string, top: number, mincount: number): Observable<any> {
    console.log('Get data')
    const headers = {'content-type': 'application/json'};
    // Query Parameters
    const params = {
      date: date,
      top: top,
      mincount: mincount
    };
    return this.http.get(this.baseURL + '/network', {headers, params});
  }
  getBoundaries(date: string): Observable<any> {
    console.log('Get data')
    const headers = {'content-type': 'application/json'};
    // Query Parameters
    const params = {
      date: date
    };
    return this.http.get(this.baseURL + '/boundaries', {headers, params});
  }

}
