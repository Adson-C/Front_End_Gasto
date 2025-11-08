import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatarNumero',
  standalone: true
})
export class FormatarNumeroPipe implements PipeTransform {

  transform(value: any) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

}
