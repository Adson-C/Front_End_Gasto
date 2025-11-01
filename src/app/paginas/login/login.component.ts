import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2'; // npm install sweetalert2
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../servicos/token.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuarios:any;

  constructor(private tokenService: TokenService, private cookieService: CookieService) 
  {
    this.usuarios = 
    {
      correo: '',
      password: ''
    };
  }
  enviar()
  {
    if (this.usuarios.correo == 0 || this.usuarios.password == '')
      {
        Swal.fire({
          icon: 'error',
          timer: 2000,
          title: 'Erro',
          text: 'O campo email é obrigatório',
        });
        return false;
      }
      if (this.usuarios.password == 0 || this.usuarios.password == '')
        {
          Swal.fire({
            icon: 'error',
            timer: 2000,
            title: 'Erro',
            text: 'O campo password é obrigatório',
          });
          return false;
        }
        this.tokenService.getToken({correo: this.usuarios.correo, password: this.usuarios.password}).
        subscribe({
          next: (res: any) => {
            console.log(res);
            this.cookieService.set('despesas_gasto_token', res.token, 1);
            this.cookieService.set('despesas_gasto_nome', res.nome, 1);
            this.cookieService.set('despesas_gasto_id', res.id, 1);
            this.cookieService.set('despesas_gasto_perfil_nome', res.perfil_nome, 1);
            this.cookieService.set('despesas_gasto_perfil_id', res.perfil_id, 1);
            window.location.href = '/';
          },
          error: (err: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Ops...',
              timer: 2000,
              text: 'Ocorreu um erro ao fazer login',
            });
            console.log(err);
            window.location.href = '/login';
          },
        });
        return true;
  }
}
