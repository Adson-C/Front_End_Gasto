# 💸 FrontGasto – Controle de Gastos Pessoais

FrontGasto é uma aplicação web desenvolvida em Angular que auxilia no controle, visualização e análise dos seus gastos e receitas mensais, tornando seu planejamento financeiro mais prático, simples e visual.

<img src="assets/img/photos/logo.png" alt="FrontGasto Logo" width="200">

## ✨ Funcionalidades Principais

- **Dashboard Financeiro**: Resumo gráfico das receitas, despesas, saldo e outras informações do mês.
- **Lançamento de Receitas**: Cadastre todos os seus recebimentos (salários, vales, extras, etc).
- **Lançamento de Despesas Fixas**: Organize e acompanhe seus gastos fixos, pagos e não pagos.
- **Filtros Avançados**: Pesquise e filtre lançamentos por período, tipo, provedor e status de pagamento.
- **Gráficos Interativos**: Visualize suas finanças com gráficos de barras e pizza usando Chart.js.
- **Gestão de Usuários**: (Para administradores) controle o acesso de usuários no sistema.

## 🚀 Tecnologias Utilizadas

- [Angular 17+](https://angular.io/)
- [Chart.js](https://www.chartjs.org/)
- [SweetAlert2](https://sweetalert2.github.io/) (pop-ups amigáveis)
- Bootstrap 5, FontAwesome

## 🖥️ Como Executar o Projeto

1. **Pré-requisitos**
   - Node.js 18+ e NPM instalados
   - Angular CLI `npm install -g @angular/cli`

2. **Clonando o Repositório**
   ```bash
   git clone https://github.com/seu-usuario/frontgasto.git
   cd frontgasto/frontgasto
   ```

3. **Instalando Dependências**
   ```bash
   npm install
   ```

4. **Rodando o Projeto**
   ```bash
   ng serve
   ```
   Acesse em: [http://localhost:4200](http://localhost:4200)

## 🧪 Scripts Disponíveis

- `ng serve` – Executa app em modo de desenvolvimento.
- `ng build` – Gera build de produção na pasta `dist/`.
- `ng test` – Executa testes unitários via Karma.
- `ng e2e` – Executa testes end-to-end (após instalar dependências de e2e).

## 📁 Organização das Pastas

- `src/app/componentes/` – Componentes reutilizáveis (menu, header, footer)
- `src/app/paginas/` – Páginas do sistema (home, receitas, despesas, etc)
- `src/app/servicos/` – Serviços e integrações de dados
- `src/app/pipes/` – Pipes personalizados
- `assets/` – Imagens, arquivos estáticos

## 📊 Demonstração

Veja abaixo alguns recursos da aplicação:
- **Cards Resumo**: saldo, receitas, despesas
- **Gráficos por categoria e por status**
- **Lista detalhada de gastos e receitas**

![Dashboard](assets/img/demo/dashboard.png)

## 🙌 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para criar issues ou pull requests.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Desenvolvido com 💚 por [Adson Sá](https://github.com/Adson-C)
