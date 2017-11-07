import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Content } from 'ionic-angular';

// Pages
import { HomePage } from '../../home/home';

// Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { ToastProvider } from '../../../providers/toast';
import { PacienteProvider } from '../../../providers/paciente';

@Component({
  selector: 'page-recuperar-password',
  templateUrl: 'recuperar-password.html',
})
export class RecuperarPasswordPage {
  public formRecuperar: any;
  public formResetear: any;
  public displayForm: boolean = false;
  public reset: any = {};
  private inProgress = false;
  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider: AuthProvider,
    public toast: ToastProvider,
    public formBuilder: FormBuilder,
    public pacienteProvider: PacienteProvider) {

    let emailRegex = '^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$';

    this.formRecuperar = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])]
    });

    this.formResetear = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])],
      codigo: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      password2: ['', Validators.compose([Validators.required])]
    });
  }

  ionViewDidLoad() {
    //
  }

  sendCode() {
    if (this.formRecuperar) {
      const email = this.formRecuperar.value.email;
      this.inProgress = true;
      this.authProvider.resetPassword(email).then( result => {
        this.inProgress = false;
        this.content.scrollToTop();
        this.toast.success("Su codigo ha sido enviado, por favor revise su email");
        this.displayForm= true;
        this.formResetear.patchValue({email: email});
      }).catch(error => {
        this.inProgress = false;
        if (error) {
          this.toast.danger(error.error);
        }
      });
    }
  }

  yaTengo() {
    this.displayForm= true;
    this.content.scrollToTop();
  }

  resetPassword() {
    if (this.formResetear) {

      let email = this.formResetear.value.email;
      let codigo = this.formResetear.value.codigo;
      let password = this.formResetear.value.password;
      let password2 = this.formResetear.value.password2;

      if ( password != password2) {
        this.toast.danger('LAS CONTRASEÑAS NO COINCIDEN');
        return;
      }
      this.inProgress = true;
      this.authProvider.restorePassword(email, codigo, password, password2).then((data) => {
        this.inProgress = false;
        this.toast.success('PASSWORD MODIFICADO CORRECTAMENTE');
        this.navCtrl.setRoot(HomePage);
      }).catch((err) => {
        this.inProgress = false;
        if (err) {
          this.toast.danger(err.error);
        }
      });
    }
  }

  cancel() {
    this.displayForm = false,
    this.reset = {};
  }
}