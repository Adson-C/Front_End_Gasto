import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { AuthService } from '../../servicos/auth.service';
import { ProveedoresService } from '../../servicos/proveedores.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, MenuComponent, FormsModule, RouterLink],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent implements OnInit {

  datos: Array<any> = [];
  datosPaginados: Array<any> = [];
  //modal para criar, editar e excluir proveedores
  @ViewChild('myModalConfig', { static: true }) myModalConfig!: TemplateRef<any>;
  modalTitle!: string;
  modelproveedor: any = { id: '', nome: '' };
  // Variáveis de paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 5;
  totalItens: number = 0;
  totalPaginas: number = 0;
  Math = Math;

  constructor(
    private authService: AuthService,
    private proveedoresService: ProveedoresService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.authService.metodoAuth();
    this.getProveedores();
  }

  getProveedores() {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Token não encontrado');
      window.location.href = '/login';
      return;
    }
    this.proveedoresService.getProveedores(token).subscribe({
      next: (data) => {
        this.datos = Array.isArray(data) ? data : [];
        this.totalItens = this.datos.length;
        this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
        this.paginaAtual = 1;
        this.atualizarDadosPaginados();
      },
      error: (error) => {
        console.error('Erro na requisição:', error);
        if (error.status === 401 || error.status === 403) {
          window.location.href = '/login';
        }
      }
    });
  }

  Criar() {
    this.modalService.open(this.myModalConfig, { centered: true, size: 'lg' });
    this.modalTitle = 'Criar';
    this.modelproveedor = {
      id: '',
      nome: ''
    };
  }

  Editar(dato: any) {
    this.modalService.open(this.myModalConfig, { size: 'lg' });
    this.modalTitle = 'Editar';
    this.modelproveedor = {
      id: dato.id,
      nome: dato.nome
    };
  }

  deletarProveedor(id: any) {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Token não encontrado');
      window.location.href = '/login';
      return;
    }
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você realmente deseja deletar este provedor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedoresService.deleteProveedores(id, token).subscribe({
          next: (response) => {
            // Sucesso: status 200/204
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Deletado!',
              text: response && response.body && response.body.message
                ? response.body.message
                : 'O provedor foi deletado com sucesso.',
              timer: 1500,
              showConfirmButton: false
            });
            this.getProveedores();
          },
          error: (error) => {
            console.error('Erro ao deletar provedor:', error);
            if (error.status === 401 || error.status === 403) {
              window.location.href = '/login';
            } else if (
              error.status === 409 ||
              (error.error && error.error.message && error.error.message.includes('existem registros relacionados'))
            ) {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Não foi possível deletar',
                text: error.error && error.error.message
                  ? error.error.message
                  : 'Não foi possível deletar o provedor porque existem registros relacionados.',
                timer: 4000,
                showConfirmButton: false
              });
            } else if (
              error.status === 404 ||
              (error.error && error.error.message && error.error.message.includes('não encontrado'))
            ) {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Não encontrado',
                text: error.error && error.error.message
                  ? error.error.message
                  : 'O provedor não foi encontrado.',
                timer: 3000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: error.error && error.error.message
                  ? error.error.message
                  : 'Não foi possível deletar o provedor. Tente novamente.',
                timer: 3000,
                showConfirmButton: false
              });
            }
          }
        });
      }
    });
  }

  enviar() {
    if (this.modalTitle === 'Criar') {
      this.proveedoresService.addProveedores({ nome: this.modelproveedor.nome }, this.authService.getToken()).subscribe({
        next: (data) => {
          Swal.fire({
            icon: 'success' as SweetAlertIcon,
            title: 'Sucesso',
            text: 'Dados criado com sucesso',
          });
          setTimeout(() => {
            this.getProveedores();
            this.modalService.dismissAll();
          }, 1500);
        },
        error: (error) => {
          console.error('Erro na requisição:', error);
          if (error.status === 401 || error.status === 403) {
            window.location.href = '/login';
          }
        }
      });
    }
    if (this.modalTitle === 'Editar') {
      this.proveedoresService.updateProveedores({ nome: this.modelproveedor.nome }, this.authService.getToken(), this.modelproveedor.id).subscribe({
        next: (data) => {
          Swal.fire({
            icon: 'success' as SweetAlertIcon,
            title: 'Sucesso',
            text: 'Dados Editado com sucesso',
          });
          setTimeout(() => {
            this.getProveedores();
            this.modalService.dismissAll();
          }, 1500);
        },
        error: (error) => {
          console.error('Erro na requisição:', error);
          if (error.status === 401 || error.status === 403) {
            window.location.href = '/login';
          }
        }
      });
    }
  }

  // Métodos de paginação
  atualizarDadosPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.datosPaginados = this.datos.slice(inicio, fim);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarDadosPaginados();
      // Scroll para o topo da tabela
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.irParaPagina(this.paginaAtual - 1);
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.irParaPagina(this.paginaAtual + 1);
    }
  }

  alterarItensPorPagina() {
    this.paginaAtual = 1;
    this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
    this.atualizarDadosPaginados();
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);

    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  getIndiceInicial(): number {
    if (this.totalItens === 0) return 0;
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  getIndiceFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens);
  }
}
