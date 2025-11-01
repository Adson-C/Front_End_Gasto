import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicos/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit{
  perfil_id:any;
  
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.perfil_id = this.authService.getPerfilId();
  }



}
