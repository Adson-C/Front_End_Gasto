import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import dayjs, { locale } from 'dayjs';

import "dayjs/locale/pt-br";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  hora:any;

  ngOnInit(): void {
    this.getHoraAtual();
  }

  getDataAtual(){
    dayjs:locale('pt-br')
    let dataAtual = new Date();
    return dayjs(dataAtual).
    format('dddd') + " " + dayjs(dataAtual).format('DD') + " de " + dayjs(dataAtual).format('MMMM') + " de " + dayjs(dataAtual).format('YYYY');
  }
  getHoraAtual()
  {
    setInterval(() => {
      this.hora = new Date();
    }, 1000); 
  }
}
