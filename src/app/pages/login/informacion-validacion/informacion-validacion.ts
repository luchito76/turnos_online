import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastProvider } from 'src/providers/toast';
import { PacienteProvider } from 'src/providers/paciente';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ScanParser } from 'src/providers/scan-parser';
import { DeviceProvider } from 'src/providers/auth/device';

@Component({
    selector: 'app-informacion-validacion',
    templateUrl: 'informacion-validacion.html',
})
export class InformacionValidacionPage implements OnInit {

    loading: any;
    modelo: any = {};
    info: any;
    paciente: any = {};
    public textoLibre: string = null;
    public formRegistro: any;
    public infoNrotramite = false;
    public infoScan = false;
    public showAccountInfo = false;
    accountNombre: any;
    public scanValido = false;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private toastCtrl: ToastProvider,
        public toastController: ToastController,
        private pacienteProvider: PacienteProvider,
        private barcodeScanner: BarcodeScanner,
        private scanParser: ScanParser,
        private device: DeviceProvider) {
    }

    ngOnInit(): void {
        const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+[\.]{1}[a-z]{2,4}$';
        const patronDocumento = '^[1-9]{1}[0-9]{4,7}$';
        const patronContactoNumerico = '^[1-9]{3}[0-9]{6,7}$';
        this.formRegistro = this.formBuilder.group({
            documento: ['', Validators.compose([Validators.required, Validators.pattern(patronDocumento)])],
            celular: ['', Validators.compose([Validators.required, Validators.pattern(patronContactoNumerico)])],
            email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])],
            tramite: ['', Validators.compose([Validators.required])],
            sexo: ['', Validators.compose([Validators.required])],
            recaptcha: ['', Validators.compose([Validators.required])]
        });
        this.device.getToken().then(token => {
            this.paciente.fcmToken = token;
        });

    }

    trimEmail(value) {
        this.formRegistro.patchValue({
            email: value.replace(/\s/g, '').toLowerCase()
        });
    }

    public cancel() {
        this.router.navigate(['/home']);
    }

    registrarUsuario() {
        this.loading = true;
        this.paciente.documento = this.formRegistro.controls.documento.value;
        this.paciente.sexo = this.formRegistro.controls.sexo.value;
        this.paciente.tramite = this.formRegistro.controls.tramite.value;
        this.paciente.telefono = this.formRegistro.controls.celular.value;
        this.paciente.email = this.formRegistro.controls.email.value;
        this.paciente.recaptcha = this.formRegistro.controls.recaptcha.value;
        this.paciente.scan = this.scanValido;


        this.pacienteProvider.registro(this.paciente).then(async (resultado: any) => {
            if (resultado._id) {
                this.loading = false;
                const toast = await this.toastController.create({
                    message: 'Su cuenta ha sido creada con éxito.',
                    duration: 5000,
                    color: 'success'
                });
                await toast.present();
                // this.accountNombre = `${resultado.apellido}, ${resultado.nombre}`;
                // this.showAccountInfo = true;
            }
        }).catch(async (err) => {
            this.showAccountInfo = false;
            this.loading = false;
            const toast = await this.toastController.create({
                message: err.error._body,
                duration: 5000,
                color: 'danger'
            });
            await toast.present();
        });
        this.cleanCaptcha();
    }

    addContacto(key, value) {
        const index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor = value;
        } else {
            const nuevo = {
                tipo: key,
                valor: value,
                ranking: 1,
                activo: true,
                ultimaActualizacion: new Date()
            };
            this.paciente.contacto.push(nuevo);
        }
    }

    cleanCaptcha() {
        this.formRegistro.controls.recaptcha.reset();
    }

    get celular() {
        return this.formRegistro.get('celular');
    }

    infoNT() {
        this.infoNrotramite = !this.infoNrotramite;
    }

    showInfoScan() {
        this.infoScan = !this.infoScan;
    }

    scanner() {
        this.barcodeScanner.scan(
            {
                preferFrontCamera: false,
                formats: 'QR_CODE,PDF_417',
                disableSuccessBeep: false,
                showTorchButton: true,
                torchOn: true,
                prompt: 'Poner el código de barra en la cámara',
                resultDisplayDuration: 500,
            }

        ).then((barcodeData) => {
            const datos = this.scanParser.scan(barcodeData.text);
            if (datos) {
                this.formRegistro.controls.sexo.setValue(datos.sexo.toLowerCase());
                this.formRegistro.controls.documento.setValue(datos.documento);
                this.formRegistro.controls.tramite.setValue(datos.tramite);
                this.formRegistro.get('recaptcha').setValidators(null);
                this.formRegistro.get('recaptcha').updateValueAndValidity();
                this.scanValido = true;
            } else {
                this.toastCtrl.danger('Documento invalido');
            }
        }, (err) => {
        });
    }

    cleanScan() {
        this.formRegistro.controls.sexo.setValue('');
        this.formRegistro.controls.documento.setValue('');
        this.formRegistro.get('recaptcha').setValidators([Validators.required]);
        this.formRegistro.get('recaptcha').updateValueAndValidity();
        this.scanValido = false;

    }



}
