import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Proveedores } from '../interface/proveedores';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private _http: HttpClient) { }

  getProveedores(token: any): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}v1/proveedores`, {
      headers: {'Authorization': `Bearer ${token}`}});
  }
  addProveedores(modelo: Proveedores, token: any): Observable<any> {
    
    return this._http.post<any>(`${environment.apiUrl}v1/proveedores`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // atualizar proveedores
  updateProveedores(modelo: Proveedores, token: any, id: any): Observable<any> {
    return this._http.put<any>(`${environment.apiUrl}v1/proveedores/${id}`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // deletar proveedores
  deleteProveedores(id: any, token: any): Observable<any> {
    return this._http.delete<any>(`${environment.apiUrl}v1/proveedores/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      observe: 'response'
    });
  }
}
