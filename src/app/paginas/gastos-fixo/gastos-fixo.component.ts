import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../servicos/auth.service';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { GastosFixoService } from '../../servicos/gastos-fixo.service';
import { FormatardataPipe } from '../../pipes/formatardata.pipe';
import { FormatarNumeroPipe } from '../../pipes/formatar-numero.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedoresService } from '../../servicos/proveedores.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { EstadosService } from '../../servicos/estados.service';

@Component({
  selector: 'app-gastos-fixo',
  standalone: true,
  imports: [
    HeaderComponent,
    MenuComponent,
    FormsModule,
    RouterLink,
    FormatardataPipe,
    FormatarNumeroPipe
  ],
  templateUrl: './gastos-fixo.component.html',
  styleUrl: './gastos-fixo.component.css',
})
export class GastosFixoComponent implements OnInit {

  datos!: Array<any>;
  datosPaginados!: Array<any>;
  proveedores!: Array<any>;
  estados!: Array<any>;
  dataAtual: any;

  @ViewChild('myModalConfig', { static: true }) myModalConfig!: TemplateRef<any>;
  @ViewChild('formulario', { static: false }) formulario!: any;
  modalTitle!: string;
  modelo!: any;
  siPago!: any;
  naoPago!: any;
  totalGasto!: any;

  // Variáveis de paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 5;
  totalItens: number = 0;
  totalPaginas: number = 0;
  Math = Math;

  constructor(
    private authService: AuthService,
    private gastosFixoService: GastosFixoService,
    private modalService: NgbModal,
    private proveedoresService: ProveedoresService,
    private estadosService: EstadosService
  ) {
    this.dataAtual = new Date();
    this.modelo = {
      id: '',
      nome: '',
      quantia: '',
      proveedoreId: '',
      estadoId: 4,
    };
    this.datos = [];
    this.datosPaginados = [];
  }

  ngOnInit(): void {
    // Validação de autenticação
    this.authService.metodoAuth();
    this.fazerSolicitacao();
    this.fazerSolicitacaoProveedores();
    this.trazerEstados();
  }

  CriarGasto() {
    this.modalService.open(this.myModalConfig, { size: 'lg' });
    this.modalTitle = 'CriarGastoF'; // Corrigido typo (CriarGatsoF -> CriarGastoF)
    this.modelo = {
      id: '',
      nome: '',
      quantia: '',
      proveedoreId: '',
      estadoId: 4,
    };
  }

  EditarGasto(dato: any) {
    this.modalTitle = 'EditarGastoF';
    this.modelo = {
      id: dato.id,
      nome: dato.nome,
      quantia: dato.quantia,
      proveedoreId: dato.proveedore_id?.id ? dato.proveedore_id.id : dato.proveedoreId,
      estadoId: dato.estado_id?.id ? dato.estado_id.id : dato.estadoId
    };
    this.modalService.open(this.myModalConfig, { size: 'lg' });
  }

  DeletarGasto(dato: any) {
    this.modalTitle = 'DeletarGastoF';
    this.modelo = {
      id: dato.id,
      nome: dato.nome,
      quantia: dato.quantia,
      proveedoreId: dato.proveedoreId || (dato.proveedore_id?.id ? dato.proveedore_id.id : null),
      estadoId: dato.estadoId || (dato.estado_id?.id ? dato.estado_id.id : null)
    };
    this.modalService.open(this.myModalConfig, { size: 'lg' });
  }

  enviar() {
    if (this.modalTitle === 'CriarGastoF') {
      // Validação do proveedoreId
      const proveedoreId = Number(this.modelo.proveedoreId);
      if (!proveedoreId || proveedoreId === 0) {
        Swal.fire({
          icon: 'error' as SweetAlertIcon,
          title: 'Erro',
          text: 'Por favor, selecione um provedor.',
        });
        return;
      }

      // Constrói o payload usando os valores escolhidos no formulário
      // Certifica-se de enviar o ID correto do provedor e estado
      this.gastosFixoService
        .addGastosFixos(
          {
            nome: this.modelo.nome,
            quantia: this.modelo.quantia,
            proveedoreId: proveedoreId,
            estadoId: this.modelo.estadoId
          },
          this.authService.getToken()
        )
        .subscribe({
          next: (_data) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados criados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            // Recarregar os dados sem recarregar a página
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
                text: (error?.error?.message || 'Ocorreu um erro ao criar o gasto fixo'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao criar gasto fixo.',
              });
            }
          },
        });
    }
    if (this.modalTitle === 'EditarGastoF') {
      // Validação do proveedoreId
      const proveedoreId = Number(this.modelo.proveedoreId);
      if (!proveedoreId || proveedoreId === 0) {
        Swal.fire({
          icon: 'error' as SweetAlertIcon,
          title: 'Erro',
          text: 'Por favor, selecione um provedor.',
        });
        return;
      }

      this.gastosFixoService
        .editarGastosFixos(
          {
            nome: this.modelo.nome,
            quantia: this.modelo.quantia,
            proveedoreId: proveedoreId,
            estadoId: this.modelo.estadoId
          },
          this.authService.getToken(),
          this.modelo.id
        )
        .subscribe({
          next: (_data) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados editados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            // Recarregar os dados sem recarregar a página
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
                text: (error?.error?.message || 'Ocorreu um erro ao editar o gasto fixo'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao editar gasto fixo.',
              });
            }
          },
        });
    }
    if (this.modalTitle === 'DeletarGastoF') {
      this.gastosFixoService
        .deleteGastosFixos(this.modelo.id, this.authService.getToken())
        .subscribe({
          next: (_data) => {
            this.modalService.dismissAll(); // Fechar o modal
            Swal.fire({
              icon: 'success' as SweetAlertIcon,
              title: 'Sucesso',
              text: 'Dados deletados com sucesso',
              timer: 1500,
              showConfirmButton: false
            });
            // Recarregar os dados sem recarregar a página
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
                text: (error?.error?.message || 'Ocorreu um erro ao deletar o gasto fixo'),
              });
            } else {
              Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Erro',
                text: 'Falha inesperada ao deletar gasto fixo.',
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
    this.gastosFixoService.getGastosFixos(token).subscribe({
      next: (data) => {
        // Algumas respostas de API paginada podem vir como { content: [...], ... }
        // Tenta usar o array correto
        let gastosArray: any[] = [];

        if (Array.isArray(data)) {
          gastosArray = data;
        } else if (data && Array.isArray(data.content)) {
          gastosArray = data.content;
        } else if (data && typeof data === 'object' && Object.values(data).length > 0 && Array.isArray(Object.values(data)[0])) {
          // Caso especial para algum outro campo paginado
          gastosArray = Object.values(data)[0] as any[];
        } else if (!data) {
          gastosArray = [];
        } else {
          // fallback, tentar converter para array
          try {
            gastosArray = Array.from(data);
          } catch (e) {
            gastosArray = [];
          }
        }

        this.datos = gastosArray;
        this.totalItens = gastosArray.length;
        this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
        // Resetar para primeira página quando os dados são recarregados
        this.paginaAtual = 1;
        this.siPago = gastosArray.filter(dato => dato.estadoId === 3).reduce((acc, dato) => acc + dato.quantia, 0);
        this.naoPago = gastosArray.filter(dato => dato.estadoId === 4).reduce((acc, dado) => acc + dado.quantia, 0);
        this.totalGasto = gastosArray.reduce((acc, dado) => acc + dado.quantia, 0);
        this.atualizarDadosPaginados();
      },
      error: (error) => {
        console.error('Erro na requisição GET gastos fixos:', error);
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

  trazerEstados() {
    this.estadosService.getEstados(this.authService.getToken()).subscribe({
      next: (data) => {
        this.estados = data;
      },
      error: (error) => {
        console.error('Erro na requisição GET estados:', error);
      }
    });
  }

  fazerSolicitacaoProveedores() {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado ao tentar carregar provedores');
      return;
    }
    this.proveedoresService.getProveedores(token).subscribe({
      next: (data) => {
        this.proveedores = data || [];
      },
      error: (error) => {
        console.error('Erro na requisição GET provedores:', error);
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
          // Para outros erros, apenas loga sem redirecionar
          console.warn('Erro ao carregar provedores, mas não é erro de autenticação');
        }
      },
    });
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
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  getIndiceFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens);
  }
}
