import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Device } from '@ionic-native/device/ngx';
import { GeoProvider } from '../../providers/geo-provider';
import { take, tap } from 'rxjs/operators';


@Injectable()
export class CheckerGpsProvider {
    geoSubcribe;
    myPosition = null;

    constructor(
        public alertCtrl: AlertController,
        public platform: Platform,
        public diagnostic: Diagnostic,
        private device: Device,
        public gMaps: GeoProvider) { }

    checkGPS() {
        if (this.platform.is('cordova')) {
            this.diagnostic.isLocationEnabled().then((available) => {
                if (available) {
                    this.geoPosicionarme();
                }
            }, (error) => {
                console.error('Ha ocurrido un error: ' + error);
            });
        } else {
            this.geoPosicionarme();
        }
    }

    requestGeoRef() {

        this.diagnostic.switchToLocationSettings();
        this.diagnostic.registerLocationStateChangeHandler(
            (state) => {
                this.hayUbicacion(state);
            });

    }

    hayUbicacion(state) {
        if ((this.device.platform === 'Android' && state !== this.diagnostic.locationMode.LOCATION_OFF)
            || (this.device.platform === 'iOS') && (state === this.diagnostic.permissionStatus.GRANTED
                || state === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE
            )) {
            this.geoPosicionarme();
        }
    }


    geoPosicionarme() {
        return this.gMaps.watchPosition().pipe(
            take(1),
            tap((position: any) => {
                this.myPosition = position.coords;
                this.gMaps.setActual(this.myPosition);
            })
        );
    }
}
