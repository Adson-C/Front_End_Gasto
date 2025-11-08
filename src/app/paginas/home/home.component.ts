import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { AuthService } from '../../servicos/auth.service';
import { GastosFixoService } from '../../servicos/gastos-fixo.service';
import { ReceitasService } from '../../servicos/receitas.service';
import { FormatarNumeroPipe } from '../../pipes/formatar-numero.pipe';
import dayjs from 'dayjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';

// Importações do Chart.js
// Para instalar: npm install chart.js --save
// Nota: ng2-charts requer Angular 20+, então usamos Chart.js diretamente
let Chart: any = null;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent,
    MenuComponent,
    FormatarNumeroPipe
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gastosFixosBarChartCanvas') gastosFixosBarChartCanvas!: ElementRef<HTMLCanvasElement>;

  private barChart: any = null;
  private pieChart: any = null;
  private gastosFixosBarChart: any = null;
  chartJsAvailable: boolean = false;

  // Dados financeiros
  totalReceitas: number = 0;
  totalGastosFixos: number = 0;
  saldo: number = 0;
  siPago: number = 0;
  naoPago: number = 0;
  totalSalario: number = 0;
  totalVale: number = 0;
  totalExtra: number = 0;
  totalOutros: number = 0;

  // Dados completos para filtros
  todasReceitas: any[] = [];
  todosGastosFixos: any[] = [];

  // Checkboxes para filtros de receitas
  filtroReceitas = {
    salario: true,
    vale: true,
    extra: true,
    outros: true
  };

  // Checkboxes para filtros de gastos fixos (por nome)
  filtroGastosFixosPorNome: { [key: string]: boolean } = {};

  // Lista de nomes únicos de gastos fixos
  nomesGastosFixos: string[] = [];

  // Variáveis de paginação para tabela de gastos fixos
  gastosFixosPaginados: any[] = [];
  paginaAtualGastos: number = 1;
  itensPorPaginaGastos: number = 5;
  totalItensGastos: number = 0;
  totalPaginasGastos: number = 0;
  Math = Math;

  constructor(
    private authService: AuthService,
    private gastosFixoService: GastosFixoService,
    private receitasService: ReceitasService
  ) {
    // Verificar se Chart.js está disponível
    this.verificarChartJs();
  }

  async verificarChartJs() {
    try {
      // Importação dinâmica do Chart.js (só funciona se estiver instalado)
      const module = await import('chart.js' as any).catch(() => null);
      if (module && module.Chart) {
        Chart = module.Chart;
        if (module.registerables) {
          Chart.register(...module.registerables);
        }
        this.chartJsAvailable = true;
      } else {
        this.chartJsAvailable = false;
      }
    } catch (e) {
      this.chartJsAvailable = false;
      console.warn('Chart.js não está instalado. Execute: npm install chart.js --save');
    }
  }

  ngOnInit(): void {
    this.authService.metodoAuth();
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Aguardar um pouco para garantir que os dados foram carregados
    setTimeout(() => {
      if (this.chartJsAvailable) {
        this.criarGraficos();
        // Criar gráfico de gastos fixos após os dados serem carregados
        setTimeout(() => {
          if (this.todosGastosFixos.length > 0) {
            const gastosFiltrados = this.getGastosFixosFiltrados();
            const gastosAgrupados: { [key: string]: number } = {};
            gastosFiltrados.forEach(gasto => {
              const nome = gasto.nome || 'Sem nome';
              gastosAgrupados[nome] = (gastosAgrupados[nome] || 0) + (gasto.quantia || 0);
            });
            const labels = Object.keys(gastosAgrupados);
            const data = Object.values(gastosAgrupados);
            this.criarGraficoGastosFixos(labels, data);
          }
        }, 300);
      }
    }, 500);
  }

  criarGraficos() {
    if (!this.chartJsAvailable || !Chart) return;

    // Criar gráfico de barras
    if (this.barChartCanvas && this.barChartCanvas.nativeElement) {
      if (this.barChart) {
        this.barChart.destroy();
      }
      this.barChart = new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Receitas', 'Gastos Fixos', 'Saldo'],
          datasets: [{
            label: 'Valores (R$)',
            data: [this.totalReceitas, this.totalGastosFixos, this.saldo],
            backgroundColor: [
              'rgba(13, 238, 13, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)'
            ],
            borderColor: [
              'rgba(13, 238, 13, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return `R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value: any) => {
                  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            }
          }
        }
      });
    }

    // Criar gráfico de pizza
    if (this.pieChartCanvas && this.pieChartCanvas.nativeElement) {
      if (this.pieChart) {
        this.pieChart.destroy();
      }
      // Preparar dados iniciais do gráfico de pizza
      const labelsIniciais: string[] = [];
      const dataInicial: number[] = [];
      const coresIniciais: string[] = [];
      const coresBordaIniciais: string[] = [];

      if (this.filtroReceitas.salario && this.totalSalario > 0) {
        labelsIniciais.push('Salário');
        dataInicial.push(this.totalSalario);
        coresIniciais.push('rgba(54, 162, 235, 0.6)');
        coresBordaIniciais.push('rgba(54, 162, 235, 1)');
      }
      if (this.filtroReceitas.vale && this.totalVale > 0) {
        labelsIniciais.push('Vale');
        dataInicial.push(this.totalVale);
        coresIniciais.push('rgba(255, 206, 86, 0.6)');
        coresBordaIniciais.push('rgba(255, 206, 86, 1)');
      }
      if (this.filtroReceitas.extra && this.totalExtra > 0) {
        labelsIniciais.push('Extra');
        dataInicial.push(this.totalExtra);
        coresIniciais.push('rgba(75, 192, 192, 0.6)');
        coresBordaIniciais.push('rgba(75, 192, 192, 1)');
      }
      if (this.filtroReceitas.outros && this.totalOutros > 0) {
        labelsIniciais.push('Outros');
        dataInicial.push(this.totalOutros);
        coresIniciais.push('rgba(153, 102, 255, 0.6)');
        coresBordaIniciais.push('rgba(153, 102, 255, 1)');
      }

      this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: labelsIniciais.length > 0 ? labelsIniciais : ['Salário', 'Vale', 'Extra', 'Outros'],
          datasets: [{
            data: dataInicial.length > 0 ? dataInicial : [this.totalSalario, this.totalVale, this.totalExtra, this.totalOutros],
            backgroundColor: coresIniciais.length > 0 ? coresIniciais : [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ],
            borderColor: coresBordaIniciais.length > 0 ? coresBordaIniciais : [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  atualizarGraficos() {
    if (this.chartJsAvailable) {
      if (this.barChart) {
        // Obter gastos fixos filtrados para o gráfico de barras
        const gastosFiltrados = this.getGastosFixosFiltrados();
        const totalGastosFiltrados = gastosFiltrados.reduce((acc, dado) => acc + (dado.quantia || 0), 0);

        this.barChart.data.datasets[0].data = [this.totalReceitas, totalGastosFiltrados, this.saldo];
        this.barChart.update();
      }
      if (this.pieChart) {
        // Atualizar apenas os tipos de receitas selecionados
        const labels: string[] = [];
        const data: number[] = [];
        const cores: string[] = [];
        const coresBorda: string[] = [];

        if (this.filtroReceitas.salario && this.totalSalario > 0) {
          labels.push('Salário');
          data.push(this.totalSalario);
          cores.push('rgba(54, 162, 235, 0.6)');
          coresBorda.push('rgba(54, 162, 235, 1)');
        }
        if (this.filtroReceitas.vale && this.totalVale > 0) {
          labels.push('Vale');
          data.push(this.totalVale);
          cores.push('rgba(255, 206, 86, 0.6)');
          coresBorda.push('rgba(255, 206, 86, 1)');
        }
        if (this.filtroReceitas.extra && this.totalExtra > 0) {
          labels.push('Extra');
          data.push(this.totalExtra);
          cores.push('rgba(75, 192, 192, 0.6)');
          coresBorda.push('rgba(75, 192, 192, 1)');
        }
        if (this.filtroReceitas.outros && this.totalOutros > 0) {
          labels.push('Outros');
          data.push(this.totalOutros);
          cores.push('rgba(153, 102, 255, 0.6)');
          coresBorda.push('rgba(153, 102, 255, 1)');
        }

        this.pieChart.data.labels = labels;
        this.pieChart.data.datasets[0].data = data;
        this.pieChart.data.datasets[0].backgroundColor = cores;
        this.pieChart.data.datasets[0].borderColor = coresBorda;
        this.pieChart.update();
      }
    }
  }

  atualizarGraficoGastosFixos() {
    if (!this.chartJsAvailable || !Chart) return;

    if (this.gastosFixosBarChartCanvas && this.gastosFixosBarChartCanvas.nativeElement) {
      const gastosFiltrados = this.getGastosFixosFiltrados();

      // Agrupar por nome e somar valores
      const gastosAgrupados: { [key: string]: number } = {};
      gastosFiltrados.forEach(gasto => {
        const nome = gasto.nome || 'Sem nome';
        gastosAgrupados[nome] = (gastosAgrupados[nome] || 0) + (gasto.quantia || 0);
      });

      const labels = Object.keys(gastosAgrupados);
      const data = Object.values(gastosAgrupados);

      if (this.gastosFixosBarChart) {
        this.gastosFixosBarChart.data.labels = labels;
        this.gastosFixosBarChart.data.datasets[0].data = data;
        this.gastosFixosBarChart.update();
      } else {
        this.criarGraficoGastosFixos(labels, data);
      }
    }
  }

  criarGraficoGastosFixos(labels: string[], data: number[]) {
    if (!this.chartJsAvailable || !Chart) return;

    if (this.gastosFixosBarChartCanvas && this.gastosFixosBarChartCanvas.nativeElement) {
      // Gerar cores dinamicamente
      const cores = labels.map((_, index) => {
        const hue = (index * 137.508) % 360; // Golden angle approximation
        return `hsla(${hue}, 70%, 50%, 0.7)`;
      });
      const coresBorda = labels.map((_, index) => {
        const hue = (index * 137.508) % 360;
        return `hsla(${hue}, 70%, 50%, 1)`;
      });

      this.gastosFixosBarChart = new Chart(this.gastosFixosBarChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Valor (R$)',
            data: data,
            backgroundColor: cores,
            borderColor: coresBorda,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return `R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value: any) => {
                  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
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

  carregarDados() {
    this.carregarReceitas();
    this.carregarGastosFixos();
  }

  carregarReceitas() {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado ao tentar carregar receitas');
      return;
    }

    this.receitasService.getReceitas(token).subscribe({
      next: (data: any) => {
        let receitasArray: any[] = [];

        if (Array.isArray(data)) {
          receitasArray = data;
        } else if (data && Array.isArray(data.content)) {
          receitasArray = data.content;
        } else if (data && typeof data === 'object' && Object.values(data).length > 0 && Array.isArray(Object.values(data)[0])) {
          receitasArray = Object.values(data)[0] as any[];
        } else if (!data) {
          receitasArray = [];
        } else {
          try {
            receitasArray = Array.from(data);
          } catch (e) {
            receitasArray = [];
          }
        }

        // Armazenar todas as receitas
        this.todasReceitas = receitasArray;

        // Calcular totais filtrados
        this.atualizarTotaisReceitas();
      },
      error: (error) => {
        console.error('Erro ao carregar receitas:', error);
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
        }
      }
    });
  }

  carregarGastosFixos() {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado ao tentar carregar gastos fixos');
      return;
    }

    this.gastosFixoService.getGastosFixos(token).subscribe({
      next: (data: any) => {
        let gastosArray: any[] = [];

        if (Array.isArray(data)) {
          gastosArray = data;
        } else if (data && Array.isArray(data.content)) {
          gastosArray = data.content;
        } else if (data && typeof data === 'object' && Object.values(data).length > 0 && Array.isArray(Object.values(data)[0])) {
          gastosArray = Object.values(data)[0] as any[];
        } else if (!data) {
          gastosArray = [];
        } else {
          try {
            gastosArray = Array.from(data);
          } catch (e) {
            gastosArray = [];
          }
        }

        // Armazenar todos os gastos fixos
        this.todosGastosFixos = gastosArray;

        // Inicializar filtros por nome dos gastos fixos
        this.inicializarFiltrosGastosFixos();

        // Calcular totais filtrados
        this.atualizarTotaisGastosFixos();
        // Atualizar paginação
        this.atualizarGastosFixosPaginados();
      },
      error: (error) => {
        console.error('Erro ao carregar gastos fixos:', error);
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
        }
      }
    });
  }

  calcularSaldo() {
    this.saldo = this.totalReceitas - this.totalGastosFixos;
    this.atualizarGraficos();
  }

  // Métodos para atualizar totais baseado nos filtros
  atualizarTotaisReceitas() {
    let receitasFiltradas = this.todasReceitas.filter(receita => {
      const tipo = receita.tipoReceita;
      if (tipo === 'SALARIO' && !this.filtroReceitas.salario) return false;
      if (tipo === 'VALE' && !this.filtroReceitas.vale) return false;
      if (tipo === 'EXTRA' && !this.filtroReceitas.extra) return false;
      if (tipo === 'OUTROS' && !this.filtroReceitas.outros) return false;
      return true;
    });

    this.totalReceitas = receitasFiltradas.reduce((acc, dato) => acc + (dato.valor || 0), 0);
    this.totalSalario = receitasFiltradas.filter((dato) => dato.tipoReceita === 'SALARIO').reduce((acc, dato) => acc + (dato.valor || 0), 0);
    this.totalVale = receitasFiltradas.filter((dato) => dato.tipoReceita === 'VALE').reduce((acc, dato) => acc + (dato.valor || 0), 0);
    this.totalExtra = receitasFiltradas.filter((dato) => dato.tipoReceita === 'EXTRA').reduce((acc, dato) => acc + (dato.valor || 0), 0);
    this.totalOutros = receitasFiltradas.filter((dato) => dato.tipoReceita === 'OUTROS').reduce((acc, dato) => acc + (dato.valor || 0), 0);

    this.calcularSaldo();
  }

  inicializarFiltrosGastosFixos() {
    // Obter nomes únicos dos gastos fixos
    const nomesUnicos = [...new Set(this.todosGastosFixos.map(gasto => gasto.nome).filter(nome => nome))];
    this.nomesGastosFixos = nomesUnicos.sort();

    // Inicializar todos os filtros como true (selecionados)
    this.nomesGastosFixos.forEach(nome => {
      if (!this.filtroGastosFixosPorNome.hasOwnProperty(nome)) {
        this.filtroGastosFixosPorNome[nome] = true;
      }
    });
  }

  atualizarTotaisGastosFixos() {
    let gastosFiltrados = this.todosGastosFixos.filter(gasto => {
      const nome = gasto.nome;
      // Se o nome não estiver no filtro ou estiver desmarcado, excluir
      if (!nome || !this.filtroGastosFixosPorNome[nome]) {
        return false;
      }
      return true;
    });

    this.totalGastosFixos = gastosFiltrados.reduce((acc, dado) => acc + (dado.quantia || 0), 0);
    this.siPago = gastosFiltrados.filter(dato => dato.estadoId === 3).reduce((acc, dato) => acc + (dato.quantia || 0), 0);
    this.naoPago = gastosFiltrados.filter(dato => dato.estadoId === 4).reduce((acc, dado) => acc + (dado.quantia || 0), 0);

    this.calcularSaldo();
    this.atualizarGraficoGastosFixos();
    // Atualizar paginação quando os totais são atualizados
    this.atualizarGastosFixosPaginados();
  }

  // Métodos para alterar filtros
  onFiltroReceitasChange() {
    this.atualizarTotaisReceitas();
  }

  onFiltroGastosFixosChange() {
    this.atualizarTotaisGastosFixos();
  }

  onFiltroGastosFixosPorNomeChange() {
    this.paginaAtualGastos = 1; // Resetar para primeira página ao filtrar
    this.atualizarTotaisGastosFixos();
    this.atualizarGastosFixosPaginados();
  }

  // Obter gastos fixos filtrados para exibição
  getGastosFixosFiltrados() {
    return this.todosGastosFixos.filter(gasto => {
      const nome = gasto.nome;
      // Se o nome não estiver no filtro ou estiver desmarcado, excluir
      if (!nome || !this.filtroGastosFixosPorNome[nome]) {
        return false;
      }
      return true;
    });
  }

  // Métodos de paginação para gastos fixos
  atualizarGastosFixosPaginados() {
    const gastosFiltrados = this.getGastosFixosFiltrados();
    this.totalItensGastos = gastosFiltrados.length;
    this.totalPaginasGastos = Math.ceil(this.totalItensGastos / this.itensPorPaginaGastos);

    const inicio = (this.paginaAtualGastos - 1) * this.itensPorPaginaGastos;
    const fim = inicio + this.itensPorPaginaGastos;
    this.gastosFixosPaginados = gastosFiltrados.slice(inicio, fim);
  }

  irParaPaginaGastos(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginasGastos) {
      this.paginaAtualGastos = pagina;
      this.atualizarGastosFixosPaginados();
      // Scroll para o topo da tabela
      const elemento = document.querySelector('.table-responsive');
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  paginaAnteriorGastos() {
    if (this.paginaAtualGastos > 1) {
      this.irParaPaginaGastos(this.paginaAtualGastos - 1);
    }
  }

  proximaPaginaGastos() {
    if (this.paginaAtualGastos < this.totalPaginasGastos) {
      this.irParaPaginaGastos(this.paginaAtualGastos + 1);
    }
  }

  alterarItensPorPaginaGastos() {
    this.paginaAtualGastos = 1;
    this.atualizarGastosFixosPaginados();
  }

  getPaginasGastos(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, this.paginaAtualGastos - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(this.totalPaginasGastos, inicio + maxPaginasVisiveis - 1);

    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  getIndiceInicialGastos(): number {
    return (this.paginaAtualGastos - 1) * this.itensPorPaginaGastos + 1;
  }

  getIndiceFinalGastos(): number {
    return Math.min(this.paginaAtualGastos * this.itensPorPaginaGastos, this.totalItensGastos);
  }

  // Obter status do gasto fixo
  getStatusGasto(gasto: any): { texto: string, classe: string } {
    if (gasto.estadoId === 3) {
      return { texto: 'PAGO', classe: 'badge bg-success' };
    } else if (gasto.estadoId === 4) {
      return { texto: 'NÃO PAGO', classe: 'badge bg-danger' };
    }
    return { texto: 'DESCONHECIDO', classe: 'badge bg-secondary' };
  }

  // Obter nome do provedor
  getNomeProvedor(gasto: any): string {
    if (gasto.proveedoreNome) {
      return gasto.proveedoreNome;
    }
    if (gasto.proveedore_id?.nome) {
      return gasto.proveedore_id.nome;
    }
    if (gasto.proveedor?.nome) {
      return gasto.proveedor.nome;
    }
    return 'N/A';
  }

  getSaldoClass(): string {
    if (this.saldo > 0) {
      return 'text-success';
    } else if (this.saldo < 0) {
      return 'text-danger';
    }
    return 'text-warning';
  }

  getSaldoIcon(): string {
    if (this.saldo > 0) {
      return 'fa-arrow-up';
    } else if (this.saldo < 0) {
      return 'fa-arrow-down';
    }
    return 'fa-equals';
  }
}
