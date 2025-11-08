import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReceitasRequest } from '../interface/receitas-request';

@Injectable({
  providedIn: 'root'
})
export class ReceitasService {

  
  constructor(private _http: HttpClient) { }

  
  getReceitas(token: any): Observable<any> {

    return this._http.get<any>(`${environment.apiUrl}v1/receitas`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }

  addReceitas(modelo: ReceitasRequest, token: any): Observable<any> {
    
    return this._http.post<any>(`${environment.apiUrl}v1/receitas`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // atualizar receitas
  editarReceitas(modelo: ReceitasRequest, token: any, id: any): Observable<any> {
    return this._http.put<any>(`${environment.apiUrl}v1/receitas/${id}`, modelo, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
  // deletar receitas
  deleteReceitas(id: any, token: any): Observable<any> {
    return this._http.delete<any>(`${environment.apiUrl}v1/receitas/${id}`, { 'headers': {'Content-Type': 'application/json',  
      'Authorization': `Bearer ${token}`}});
  }
}
