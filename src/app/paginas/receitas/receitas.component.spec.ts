import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../servicos/auth.service';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { FormatardataPipe } from '../../pipes/formatardata.pipe';
import { FormatarNumeroPipe } from '../../pipes/formatar-numero.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { ReceitasService } from '../../servicos/receitas.service';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    MenuComponent,
    FormsModule,
    RouterLink,
    FormatardataPipe,
    FormatarNumeroPipe
  ],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.css',
})
export class ReceitasComponent implements OnInit {

  datos!: Array<any>;
  proveedores!: Array<any>;
  estados!: Array<any>;
  dataAtual: any;

  @ViewChild('myModalConfig', { static: true }) myModalConfig!: TemplateRef<any>;
  @ViewChild('formulario', { static: false }) formulario!: any;
  modalTitle!: string;
  modelo!: any;
  totalReceita!: any;
totalSalario: any;
totalVale: any;

  constructor(
    private authService: AuthService,
    private receitasService: ReceitasService,
    private modalService: NgbModal,
  ) {
    this.dataAtual = new Date();
    this.modelo = {
      id: '',
      tipoReceita: '',
      valor: '',
      descricao: '',
    };
  }

  ngOnInit(): void {
    // Validação de autenticação
    this.authService.metodoAuth();
    this.fazerSolicitacao();
  }

  CriarReceita() {
    this.modalService.open(this.myModalConfig, { size: 'lg' });
    this.modalTitle = 'CriarReceita'; // Corrigido typo (CriarGatsoF -> CriarGastoF)
    this.modelo = {
      id: '',
      tipoReceita: '',
      valor: '',
      descricao: '',
    };
  }

  EditarReceita(dato: any) {
    this.modalTitle = 'EditarReceita';
    this.modelo = {
      id: dato.id,
      tipoReceita: dato.tipoReceita,
      valor: dato.valor,
      descricao: dato.descricao,
    };
    this.modalService.open(this.myModalConfig, { size: 'lg' });
  }

  DeletarReceita(dato: any) {
    this.modalTitle = 'DeletarReceita';
    this.modelo = {
      id: dato.id,
      tipoReceita: dato.tipoReceita,
      valor: dato.valor,
      descricao: dato.descricao,
    };
    this.modalService.open(this.myModalConfig, { size: 'lg' });
  }

  enviar() {
    if (this.modalTitle === 'CriarReceita') {
      this.receitasService
        .addReceitas(
          {
            tipoReceita: this.modelo.tipoReceita,
            valor: this.modelo.valor,
            descricao: this.modelo.descricao,
          },
          this.authService.getToken()
        )
        .subscribe({
          next: (data: any) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados criados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            this.fazerSolicitacao();
          },
          error: (error) => {
            console.error('Erro na requisição:', error);
            if (error.status === 401 || error.status === 403) {
              window.location.href = '/login';
            } else if (error.status === 400) {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: (error?.error?.message || 'Ocorreu um erro ao criar a receita'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao criar a receita.',
              });
            }
          },
        });
    }
    else if (this.modalTitle === 'EditarReceita') {
      // Não faz sentido validar proveedoreId, pois não existe esse campo em receitas
      this.receitasService
        .editarReceitas(
          {
            tipoReceita: this.modelo.tipoReceita,
            valor: this.modelo.valor,
            descricao: this.modelo.descricao,
          },
          this.authService.getToken(),
          this.modelo.id
        )
        .subscribe({
          next: (data: any) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados editados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            this.fazerSolicitacao();
          },
          error: (error) => {
            console.error('Erro na requisição:', error);
            if (error.status === 401 || error.status === 403) {
              window.location.href = '/login';
            } else if (error.status === 400) {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: (error?.error?.message || 'Ocorreu um erro ao editar a receita'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao editar a receita.',
              });
            }
          },
        });
    }
    else if (this.modalTitle === 'DeletarReceita') {
      this.receitasService
        .deleteReceitas(this.modelo.id, this.authService.getToken())
        .subscribe({
          next: (data: any) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados deletados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            this.fazerSolicitacao();
          },
          error: (error) => {
            console.error('Erro na requisição:', error);
            if (error.status === 401 || error.status === 403) {
              window.location.href = '/login';
            } else if (error.status === 400) {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: (error?.error?.message || 'Ocorreu um erro ao deletar a receita'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao deletar a receita.',
              });
            }
          },
        });
    }
  }

  getMesAtual() {
    let date = new Date();
    dayjs.locale('pt-br');
    return dayjs(date).format('MMMM');
  }

  getAnoAtual() {
    let date = new Date();
    dayjs.locale('pt-br');
    return dayjs(date).format('YYYY');
  }

  fazerSolicitacao() {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado ao tentar carregar gastos fixos');
      return;
    }
    this.receitasService.getReceitas(token).subscribe({
      next: (data: any) => {
        // Algumas respostas de API paginada podem vir como { content: [...], ... }
        // Tenta usar o array correto
        let receitasArray: any[] = [];

        if (Array.isArray(data)) {
          receitasArray = data;
        } else if (data && Array.isArray(data.content)) {
          receitasArray = data.content;
        } else if (data && typeof data === 'object' && Object.values(data).length > 0 && Array.isArray(Object.values(data)[0])) {
          // Caso especial para algum outro campo paginado
          receitasArray = Object.values(data)[0] as any[];
        } else if (!data) {
          receitasArray = [];
        } else {
          // fallback, tentar converter para array
          try {
            receitasArray = Array.from(data);
          } catch (e) {
            receitasArray = [];
          }
        }

        this.datos = receitasArray;
        this.totalReceita = receitasArray.reduce((acc, dato) => acc + dato.valor, 0);
        this.totalSalario = receitasArray.filter((dato) => dato.tipoReceita === 'SALARIO').reduce((acc, dato) => acc + dato.valor, 0);
        this.totalVale = receitasArray.filter((dato) => dato.tipoReceita === 'VALE').reduce((acc, dato) => acc + dato.valor, 0);
        // this.paginaAtual = 1;
      },
      error: (error) => {
        console.error('Erro na requisição GET receitas:', error);
        // Só redireciona para login se realmente for erro de autenticação
        if (error.status === 401 || error.status === 403) {
          Swal.fire({
            icon: 'warning' as SweetAlertIcon,
            title: 'Sessão expirada',
            text: 'Por favor, faça login novamente.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            window.location.href = '/login';
          });
        } else {
          // Para outros erros, apenas mostra mensagem sem redirecionar
          Swal.fire({
            icon: 'error' as SweetAlertIcon,
            title: 'Erro',
            text: 'Não foi possível carregar os gastos fixos. Tente novamente.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
    });
  }

  fazerSolicitacaoTipoReceitas() {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado ao tentar carregar tipo de receitas');
      return;
    }
    this.receitasService.getReceitas(token).subscribe({
      next: (data: any) => {
        this.datos = data || [];
      },
      error: (error: any) => {
          Swal.fire({
            icon: 'warning' as SweetAlertIcon,
            title: 'Erro',
            text: 'Não foi possível carregar os tipo de receitas. Tente novamente.',
            timer: 3000,
            showConfirmButton: false
          });
      },
    });
  }
}
