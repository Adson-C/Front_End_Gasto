import { Injectable } from '@angular/core';
import { tick } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2'; // npm install sweetalert2

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService) { }

  metodoAuth(){
    if (!this.cookieService.check('despesas_gasto_token')){
      window.location.href = '/login';
    }
  }
  metodoEncerrarSessao(){
    Swal.fire({
      icon: 'warning',
      position: 'top-end',
      title: "Realmente deseja encerrar a sessão?",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.cookieService.deleteAll();
        window.location.href = '/login';
      }
    });
  }
  getId(){
    return this.cookieService.get('despesas_gasto_id');
  }
  getNome(){
    return this.cookieService.get('despesas_gasto_nome');
  }
  getPerfil(){
    return this.cookieService.get('despesas_gasto_perfil_nome');
  }
  getPerfilId(){
    return this.cookieService.get('despesas_gasto_perfil_id');
  }
  getToken(){
    return this.cookieService.get('despesas_gasto_token');
  }
}
