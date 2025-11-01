import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginInterface } from '../interface/login-interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private _http: HttpClient) { }

  getToken(modelo: LoginInterface): Observable<any> {
    console.log(`${environment.apiUrl}auth/login`)
    return this._http.post<any>(`${environment.apiUrl}auth/login`, modelo, {
      'headers': {'Content-Type': 'application/json'}
    });
  }
}
