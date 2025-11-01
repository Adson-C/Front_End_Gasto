import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { AuthService } from '../../servicos/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MenuComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.metodoAuth();
  }

}
