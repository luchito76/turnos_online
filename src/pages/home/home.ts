import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { AuthProvider } from '../../providers/auth/auth';

// pages
import { LoginPage } from '../login/login';
import { WaitingValidationPage } from '../registro/waiting-validation/waiting-validation';
import { NumerosUtilesPage } from '../datos-utiles/numeros-emergencia/numeros-utiles';
import { FarmaciasTurnoPage } from '../datos-utiles/farmacias-turno/farmacias-turno';
import { FeedNoticiasPage } from '../datos-utiles/feed-noticias/feed-noticias';
import { TurnosPage } from "../turnos/turnos";
import { AgendasPage } from "../profesional/agendas/agendas";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  mostrarMenu: boolean = true;
  user: any;
  constructor(
    public authService: AuthProvider,
    public navCtrl: NavController) {

    this.user = this.authService.user;

  }

  isLogin() {
    return this.user != null;
  }

  isPaciente() {
    return this.user && this.user.profesionalId == null;
  }

  isProfesional() {
    return this.user && this.user.profesionalId != null;
  }

  login() {
    this.navCtrl.push(LoginPage);
  }

  numerosUtiles() {
    this.navCtrl.push(NumerosUtilesPage);
  }

  farmacias() {
    this.navCtrl.push(FarmaciasTurnoPage);
  }

  noticias() {
    this.navCtrl.push(FeedNoticiasPage);
  }

  misTurnos() {
    this.navCtrl.push(TurnosPage);
  }

  misAgendas() {
    this.navCtrl.push(AgendasPage);
  }

}
