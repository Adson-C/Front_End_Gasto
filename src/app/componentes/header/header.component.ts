import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import dayjs, { locale } from 'dayjs';

import "dayjs/locale/pt-br";
import { AuthService } from '../../servicos/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  hora:any;
  nome:any;
  perfil:any;
  private intervalId: any;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getHoraAtual();
    this.nome = this.authService.getNome();
    this.perfil = this.authService.getPerfil();
  }

  ngAfterViewInit(): void {
    // Garantir que o sidebar está inicializado corretamente
    this.initializeSidebar();
    
    // Escutar mudanças de rota para reinicializar o sidebar
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Pequeno delay para garantir que o DOM foi atualizado
        setTimeout(() => {
          this.initializeSidebar();
        }, 150);
      });
  }

  ngOnDestroy(): void {
    // Limpar o interval quando o componente for destruído
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Limpar subscription do router
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializeSidebar(): void {
    // Garantir que o sidebar está inicializado corretamente após mudança de rota
    setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      const body = document.body;
      const wrapper = document.querySelector('.wrapper');
      
      if (sidebar) {
        // Verificar se há classes de collapse e garantir estado inicial
        // Múltiplas classes comuns em diferentes templates
        const collapsedClasses = ['collapsed', 'sidebar-collapsed', 'collapsed-sidebar'];
        collapsedClasses.forEach(cls => {
          sidebar.classList.remove(cls);
          if (body) body.classList.remove(cls);
          if (wrapper) (wrapper as HTMLElement).classList.remove(cls);
        });
      }
    }, 100);
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const wrapper = document.querySelector('.wrapper');
    
    if (sidebar) {
      // Toggle da classe collapsed - tentar múltiplas classes comuns
      const isCollapsed = sidebar.classList.contains('collapsed') || 
                         body.classList.contains('sidebar-collapsed') ||
                         (wrapper && (wrapper as HTMLElement).classList.contains('sidebar-collapsed'));
      
      if (isCollapsed) {
        // Expandir sidebar
        sidebar.classList.remove('collapsed');
        body.classList.remove('sidebar-collapsed');
        if (wrapper) (wrapper as HTMLElement).classList.remove('sidebar-collapsed');
      } else {
        // Colapsar sidebar
        sidebar.classList.add('collapsed');
        body.classList.add('sidebar-collapsed');
        if (wrapper) (wrapper as HTMLElement).classList.add('sidebar-collapsed');
      }
      
      // Disparar evento customizado para outros componentes que possam precisar
      const event = new CustomEvent('sidebar-toggle', {
        detail: { collapsed: !isCollapsed }
      });
      window.dispatchEvent(event);
      
      // Tentar chamar função JavaScript original se existir (para compatibilidade)
      if ((window as any).toggleSidebar) {
        try {
          (window as any).toggleSidebar();
        } catch (e) {
          console.warn('Função toggleSidebar não disponível');
        }
      }
    }
  }

  getDataAtual(){
    dayjs:locale('pt-br')
    let dataAtual = new Date();
    return dayjs(dataAtual).
    format('dddd') + " " + dayjs(dataAtual).format('DD') + " de " + dayjs(dataAtual).format('MMMM') + " de " + dayjs(dataAtual).format('YYYY');
  }
  getHoraAtual()
  {
    this.intervalId = setInterval(() => {
      this.hora = new Date();
    }, 1000); 
  }
  metodoEncerrarSessao()
  {
    this.authService.metodoEncerrarSessao();
  }
}
