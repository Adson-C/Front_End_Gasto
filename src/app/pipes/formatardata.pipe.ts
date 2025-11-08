import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'formatardata',
  standalone: true
})
export class FormatardataPipe implements PipeTransform {

  transform(value: any){
    let data = new Date(value);
    return `${dayjs(data).locale('pt-br').format('DD')}/${dayjs(data).locale('pt-br').format('MM')}/${dayjs(data).locale('pt-br').format('YYYY')}`;
  }

}
