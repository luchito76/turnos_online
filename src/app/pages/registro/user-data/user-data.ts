import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ToastProvider } from 'src/providers/toast';
import { AuthProvider } from 'src/providers/auth/auth';
import { LoadingController, NavController, NavParams, AlertController } from '@ionic/angular';
import { DeviceProvider } from 'src/providers/auth/device';
import { PasswordValidation } from 'src/validadores/validar-password';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-page-registro-user-data',
    templateUrl: 'user-data.html'
})
export class RegistroUserDataPage implements OnInit {
    loading: any;
    formRegistro: FormGroup;
    submit = false;
    errors: any = {};
    telefono: string;
    email: string;
    password: string;
    dataMpi: any = {};
    running = false;

    constructor(
        private toastCtrl: ToastProvider,
        public storage: Storage,
        public authService: AuthProvider,
        public loadingCtrl: LoadingController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public deviceProvider: DeviceProvider,
        private router: Router,
        private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.email = params.email;
            this.password = params.old_password;

            this.formRegistro = this.formBuilder.group({
                password: ['', Validators.required],
                confirmarPassword: ['', Validators.required],
            }, {
                validator: PasswordValidation.MatchPassword
            }
            );
        });
    }

    onSubmit({ value }: { value: any, valid: boolean }) {
        this.errors = {};
        this.running = true;
        this.authService.login({
            email: this.email,
            password: this.password,
            new_password: value.password
        }).then((result: any) => {
            this.running = false;
            this.deviceProvider.sync();
            this.toastCtrl.success('Listo! ');
            this.router.navigate(['/home']);
        }, (err) => {
            this.running = false;
            if (err) {
                this.toastCtrl.danger('Hubo un problema, comprobá tu conexión a Internet e intentá nuevamente.');
            }
        });
    }

}
