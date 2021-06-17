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


@Injectable()
export class DeviceProvider {
    public currentDevice: any;
    public registrationId: string = null;
    public navCtrl: NavController;
    private baseUrl = 'modules/mobileApp';

    public navigateTo: any = null;
    public notification: Observable<any>;

    constructor(
        private ngZone: NgZone,
        public device: Device,
        public storage: Storage,
        private alertCtrl: AlertController,
        public network: NetworkProvider,
        private fcm: FirebaseMessaging,
        private router: Router
    ) {

        this.storage.get('current_device').then((currentDevice) => {
            if (currentDevice) {
                this.currentDevice = currentDevice;
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
                    this.onRegister(token);
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
                });

                // Captura mensaje en background (app fuera de foco)
                this.fcm.onBackgroundMessage().subscribe(data => {
                    this.ngZone.run(() => {
                        this.onNotification('bg', JSON.parse(data.extraData));
                    });
                });

                // Si se detecta un nuevo token
                this.fcm.onTokenRefresh().subscribe(token => {
                    this.onRegister(token);
                });

            }

        });
    }
    /**
     * Persist the registration ID
     * @param data String token
     */
    onRegister(data: any) {
        this.registrationId = data;
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
                device_id: this.registrationId,
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

            const device = {
                id: this.currentDevice.id,
                device_id: this.registrationId,
                device_type: this.device.platform + ' ' + this.device.version,
                app_version: ENV.APP_VERSION
            };

            this.network.post(this.baseUrl + '/devices/update', { device }).then((data) => {
                this.currentDevice = data;
                this.storage.set('current_device', this.currentDevice);
                return resolve(this.currentDevice);
            }, reject);
        });
    }

    remove() {
        return new Promise((resolve, reject) => {
            if (!this.device.cordova) {
                reject();
                return;
            }

            this.network.post(this.baseUrl + '/devices/delete', { id: this.currentDevice.id }).then((data) => {
                this.currentDevice = data;
                this.storage.set('current_device', this.currentDevice);
                return resolve(this.currentDevice);
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
