import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AuthProvider } from './../../../../providers/auth/auth';
@Component({
    selector: 'app-popover',
    templateUrl: './popover.page.html',
})

export class PopoverPage implements OnInit {
    public callback: any;
    origen;
    user;
    esDirector;
    esJefeZona;
    public cargaMinuta = false;

    constructor(
        private params: NavParams,
        private authProvider: AuthProvider,
        private popoverController: PopoverController,
    ) { }

    ngOnInit() {
        this.origen = this.params.get('origen');
        this.callback = this.params.get('callback');
        this.user = this.authProvider.user;
        this.esDirector = this.authProvider.checkCargo('Director');
        this.esJefeZona = this.authProvider.checkCargo('JefeZona');
        this.cargaMinuta = this.origen !== 'zona' && this.origen !== 'Efector';
    }

    close(action) {
        this.popoverController.dismiss();
        this.callback(action);
    }
}
