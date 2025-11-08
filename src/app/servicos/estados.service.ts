import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  constructor(private _http: HttpClient) { }

  getEstados(token: any): Observable<any> {

    return this._http.get<any>(`${environment.apiUrl}v1/estados`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
}
