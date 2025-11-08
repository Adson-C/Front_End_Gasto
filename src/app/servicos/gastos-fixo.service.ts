import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { GastoFixoRequest } from '../interface/gasto-fixo-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GastosFixoService {

 
  constructor(private _http: HttpClient) { }

  
  getGastosFixos(token: any): Observable<any> {

    return this._http.get<any>(`${environment.apiUrl}v1/gastos-fixos`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }

  // //     @SuppressWarnings({ "serial", "unchecked" })
  getMothExact(token: any, mes: any): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}v1/gastos-fixos/${mes}`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }

  addGastosFixos(modelo: GastoFixoRequest, token: any): Observable<any> {
    
    return this._http.post<any>(`${environment.apiUrl}v1/gastos-fixos`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // atualizar gastos-fixos
  editarGastosFixos(modelo: GastoFixoRequest, token: any, id: any): Observable<any> {
    return this._http.put<any>(`${environment.apiUrl}v1/gastos-fixos/${id}`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // deletar gastos-fixos
  deleteGastosFixos(id: any, token: any): Observable<any> {
    return this._http.delete<any>(`${environment.apiUrl}v1/gastos-fixos/${id}`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
}