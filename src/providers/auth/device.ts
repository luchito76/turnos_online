import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

// providers
import { NetworkProvider } from './../network';

import { ENV } from '@app/env';
import { AuthProvider } from './auth';
import { ToastProvider } from '../toast';


@Injectable()
export class DeviceProvider {
    public currentDevice: any;
    public registrationId: string = null;
    public fcmToken: string = null;
    public navCtrl: NavController;
    private baseUrl = 'modules/mobileApp';

    public navigateTo: any = null;
    public notification: Observable<any>;

    constructor(
        private ngZone: NgZone,
        public device: Device,
        public storage: Storage,
        public authService: AuthProvider,
        private alertCtrl: AlertController,
        private toastCtrl: ToastProvider,
        public network: NetworkProvider,
        private fcm: FirebaseMessaging,
        private router: Router
    ) {

        this.storage.get('current_device').then((currentDevice) => {
            if (currentDevice) {
                this.currentDevice = currentDevice;
            } else {
                this.onRegisterDevice(this.device.uuid);
            }
        });

    }

    /**
     * Register in push notifications server
     */
    init() {

        this.fcm.requestPermission().then(hasPermission => {
            if (hasPermission) {

                // Token necesario para envío de push notifications
                this.fcm.getToken().then(token => {
                    console.log(token);
                    this.onRegisterFCM(token);
                    console.log(this.device.uuid);
                });

                // Captura cualquier mensaje en foreground (app en foco)
                this.fcm.onMessage().subscribe(data => {
                    if (data.wasTapped) {
                        // Recibido en background: no hacemos nada (ver onBackgroundMessage abajo)
                    } else {
                        // Recibido en foreground
                        this.ngZone.run(() => {
                            this.onNotification('fg', JSON.parse(data.extraData));
                        });
                    }
                    console.log('onMessage', data);

                });

                // Captura mensaje en background (app fuera de foco)
                this.fcm.onBackgroundMessage().subscribe(data => {
                    console.log('onBackgroundMessage', data);

                    this.ngZone.run(() => {
                        this.onNotification('bg', JSON.parse(data.extraData));
                    });
                });

                // Si se detecta un nuevo token
                this.fcm.onTokenRefresh().subscribe(token => {
                    this.onRegisterFCM(token);
                });

            }

        });
    }


    public getToken() {
        // Token necesario para envío de push notifications
        return this.fcm.getToken();
    }

    /**
     * Persist the registration ID
     * @param data String ID
     */
    onRegisterDevice(uuid: string) {
        this.registrationId = uuid;
    }

    /**
     * Persist the FCM token
     * @param data String token
     */
    onRegisterFCM(data: any) {
        this.fcmToken = data;
    }

    /**
     * Call when notification arrive
     * @param origin foreground (fg) o background (bg)
     * @param data Notificación
     * foreground: la notificación llega cuando la app está en foco (NO muestra push notification)
     * background: la notificación llega cuando la app está fuera de foco (SI muestra push notification, se activa al tocarla)
     */
    onNotification(origin: 'fg' | 'bg', data: any) {
        if (data.action === 'rup-adjuntar') {
            if (origin === 'bg') {
                this.router.navigate(['profesional/consultorio'], { queryParams: { id: data.id } });
            } else if (origin === 'fg') {
                data = {
                    ...data,
                    ...{
                        header: 'Consulta RUP',
                        subHeaader: 'Adjuntar documento',
                        message: 'Se detectó un pedido para adjuntar un documento desde Andes.',
                        btnText: 'Ir a RUP'
                    }
                };
                this.ngZone.run(async () => {
                    const datos: any = await this.prompt(data);
                    if (datos) {
                        this.router.navigate(['profesional/consultorio'], { queryParams: { id: datos.id } });
                    }
                });
            }
        }

        if (data.action === 'campaniaSalud') {
            this.ngZone.run(async () => {
                const datos: any = await this.prompt(data);
                if (datos) {
                    this.router.navigate(['datos-utiles/campania-detalle'], { queryParams: { campania: datos.id } });
                }
            });
        }

        if (data.action === 'codigoVerificacion') {
            this.ngZone.run(async () => {
                const credentials = {
                    email: data.userEmail,
                    password: data.codigo
                };
                this.authService.login(credentials).then((result) => {
                    this.sync();
                    this.router.navigateByUrl('/home');
                }, (err) => {
                    if (err) {
                        if (err.message === 'new_password_needed') {
                            this.router.navigate(['registro/user-data'], {
                                queryParams: {
                                    email: data.userEmail,
                                    old_password: data.codigo
                                }
                            });
                        } else {
                            this.toastCtrl.danger('Email o password incorrecto.');
                        }
                    }
                });
            });
        }

    }

    async prompt(datos) {
        const alert = await this.alertCtrl.create({
            header: datos.header,
            subHeader: datos.subHeader,
            message: datos.message || '',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancelado',
                    cssClass: 'secondary',
                    handler: (cancel) => {
                        return true;
                    }
                }, {
                    text: datos.btnText,
                    role: 'aceptado',
                    handler: () => {
                        return true;
                    }
                }
            ]
        });
        await alert.present();
        const { role } = await alert.onDidDismiss();
        if (role === 'aceptado') {
            return datos;
        }
    }

    /**
     * Call on error
     * @param data Notificación
     */
    onError(data: any) {
        console.error('Notification error', data);
    }

    register() {
        return new Promise((resolve, reject) => {
            if (!this.device.cordova) {
                reject();
                return;
            }

            const params = {
                device_id: this.device.uuid,
                device_fcm_token: this.fcmToken,
                device_type: this.device.platform + ' ' + this.device.version,
                app_version: ENV.APP_VERSION
            };

            this.network.post(this.baseUrl + '/devices/register', params).then((data) => {
                this.currentDevice = data;
                this.storage.set('current_device', this.currentDevice);
                return resolve(this.currentDevice);
            }, reject);

        });
    }

    update() {
        return new Promise((resolve, reject) => {
            if (!this.device.cordova) {
                reject();
                return;
            }

            if (this.currentDevice.id) {
                const device = {
                    id: this.currentDevice.id,
                    device_id: this.device.uuid,
                    device_fcm_token: this.fcmToken,
                    device_type: this.device.platform + ' ' + this.device.version,
                    app_version: ENV.APP_VERSION
                };

                this.network.post(this.baseUrl + '/devices/update', { device }).then((data) => {
                    this.currentDevice = data;
                    this.storage.set('current_device', this.currentDevice);
                    return resolve(this.currentDevice);
                }, reject);
            } else {
                return;
            }
        });
    }

    remove() {
        return new Promise((resolve, reject) => {
            if (!this.device.cordova) {
                reject();
                return;
            }

            this.network.post(this.baseUrl + '/devices/delete', { id: this.currentDevice.id }).then((data) => {
                return resolve(data);
            }, reject);

            this.storage.remove('current_device');
            this.currentDevice = null;

        });
    }

    sync() {
        if (ENV.REMEMBER_SESSION) {
            this.register().then(() => true, () => true);
        } else {
            if (this.currentDevice) {
                this.update().then(() => true, () => true);
            } else {
                this.register().then(() => true, () => true);
            }
        }
    }



}
