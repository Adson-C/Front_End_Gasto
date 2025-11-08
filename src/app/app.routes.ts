import { Routes } from '@angular/router';
import { HomeComponent } from './paginas/home/home.component';
import { LoginComponent } from './paginas/login/login.component';
import { UsuariosComponent } from './paginas/usuarios/usuarios.component';
import { GastosFixoComponent } from './paginas/gastos-fixo/gastos-fixo.component';
import { ProveedoresComponent } from './paginas/proveedores/proveedores.component';
import { ReceitasComponent } from './paginas/receitas/receitas.component';
import { ErrorComponent } from './paginas/error/error.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'usuarios', component: UsuariosComponent},
    {path: 'receitas', component: ReceitasComponent},
    {path: 'proveedores', component: ProveedoresComponent},
    {path: 'gastos-fixo', component: GastosFixoComponent},
    {path: '**', component: ErrorComponent},
];
