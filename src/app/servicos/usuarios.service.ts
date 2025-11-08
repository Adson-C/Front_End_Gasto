import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { UsuariosRequest } from '../interface/usuarios-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private _http: HttpClient) { }

  
  getUsuarios(token: any): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}v1/usuarios`, {
      headers: {'Authorization': `Bearer ${token}`}});
  }
  addUsuarios(modelo: UsuariosRequest, token: any): Observable<any> {
    
    return this._http.post<any>(`${environment.apiUrl}v1/usuarios`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // atualizar usuarios
  updateUsuarios(modelo: UsuariosRequest, token: any, id: any): Observable<any> {
    return this._http.put<any>(`${environment.apiUrl}v1/usuarios/${id}`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // deletar usuarios
  deleteUsuarios(id: any, token: any): Observable<any> {
    return this._http.delete<any>(`${environment.apiUrl}v1/usuarios/${id}`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }

}
