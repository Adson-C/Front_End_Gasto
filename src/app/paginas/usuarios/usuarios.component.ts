import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../servicos/auth.service';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../servicos/usuarios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MenuComponent, FormsModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})

export class UsuariosComponent implements OnInit{

  datos: any;
  @ViewChild('myModalConfig', {static: true}) myModalConfig!:TemplateRef<any>;
  modalTitle!: string;
  modelo!: any;

  constructor(private authService: AuthService,private usuariosService: UsuariosService, private modalService: NgbModal)
   {
    this.modelo = {
      id: '',
      nome: '',
      correo: '',
      password: ''
    };
   }

  ngOnInit(): void {
    this.authService.metodoAuth();
    if(parseInt(this.authService.getPerfilId()) != 1){
      window.location.href = '/app-error';
    }
    this.fazerSolicitacao();
  }

  CriarUsuario() 
  {
    this.modalService.open(this.myModalConfig, { size: 'lg'});
    this.modalTitle = 'Criar';
    this.modelo = {
      id: '',
      nome: '',
      correo: '',
      password: ''
    };
  }
  Editar(datos: any) {
    this.modalService.open(this.myModalConfig, { size: 'lg'});
    this.modalTitle = 'Editar';
    this.modelo = {
      id: datos.id,
      nome: datos.nome,
      correo: datos.correo,
      password: datos.password
    };
    }

  Deletar(datos: any) {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você deseja deletar este usuário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'SIM',
      cancelButtonText: 'NÃO',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.usuariosService.deleteUsuarios(datos.id, this.authService.getToken()).subscribe({
          next: data =>{
            console.log('Dados recebidos:', data);
          }
        });
      }
    });
  }

  enviar()
   {
    if(this.modalTitle === 'Criar') {
      this.usuariosService.addUsuarios({nome: this.modelo.nome, correo: this.modelo.correo, password: this.modelo.password}, this.authService.getToken()).subscribe({
        next: data =>{
          Swal.fire({
            icon: 'success' as SweetAlertIcon,
            title: 'Sucesso',
            text: 'Dados criado com sucesso',
          });
          setInterval(() => {
            window.location.href = '/usuarios';
          }, 3000);
        },
        error: error =>{
          console.error('Erro na requisição:', error);
          if (error.status === 401 || error.status === 403) {
            window.location.href = '/login';
          }
        }
      });
    }
    if(this.modalTitle === 'Editar') {
      this.usuariosService.updateUsuarios({nome: this.modelo.nome, correo: this.modelo.correo, password: this.modelo.password}, this.authService.getToken(), this.modelo.id).subscribe({
        next: data =>{
          Swal.fire({
            icon: 'success' as SweetAlertIcon,
            title: 'Sucesso',
            text: 'Dados editado com sucesso',
          });
          setInterval(() => {
            window.location.href = '/usuarios';
          }, 3000);
        },
        error: error =>{
          console.error('Erro na requisição:', error);
          if (error.status === 401 || error.status === 403) {
            window.location.href = '/login';
          }
        }
      });
    }
    if(this.modalTitle === 'Deletar') {
      this.usuariosService.deleteUsuarios(this.modelo.id, this.authService.getToken()).subscribe({
        next: data =>{
          Swal.fire({
            icon: 'success' as SweetAlertIcon,
            title: 'Sucesso',
            text: 'Dados deletado com sucesso',
          });
          setInterval(() => {
            window.location.href = '/usuarios';
          }, 1500);
        }, 
        error: error =>{
          console.error('Erro na requisição:', error);
          if (error.status === 401 || error.status === 403) {
            window.location.href = '/login';
          }
        }
      });
    }
    }
    
  fazerSolicitacao(){
    this.usuariosService.getUsuarios(this.authService.getToken()).subscribe({
      next: data =>{

        this.datos = data;
      },
      error: error =>{
        console.error('Erro na requisição:', error);
        if (error.status === 401 || error.status === 403) {
          window.location.href = '/login';
        }
      }
    });
  }

}
