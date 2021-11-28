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

  getDistribution(arr: any []): Observable<any> {
    console.log('post data')
    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify(arr);
    return this.http.post(this.baseURL + 'distribution', body, {'headers': headers})
  }
}
