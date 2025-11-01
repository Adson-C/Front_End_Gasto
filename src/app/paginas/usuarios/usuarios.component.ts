import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicos/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.metodoAuth();
    if(parseInt(this.authService.getPerfilId()) != 1){
      window.location.href = '/app-error';
    }
  }

}
