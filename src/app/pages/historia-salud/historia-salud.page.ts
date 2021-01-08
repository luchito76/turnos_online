import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriasProvider } from 'src/providers/historia-salud/categorias';
import { ToastProvider } from 'src/providers/toast';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-historia-salud',
    templateUrl: './historia-salud.page.html',
    styleUrls: ['./historia-salud.page.scss'],
})
export class HistoriaSaludPage implements OnInit {

    familiar: any = false;
    public categorias = [];

    constructor(
        public toastCtrl: ToastProvider,
        public categoriasProvider: CategoriasProvider,
        public router: Router,
        public storage: Storage
    ) { }

    ngOnInit() {
        this.storage.get('familiar').then((value) => {
            if (value) {
                this.familiar = value;
            }
            this.categoriasProvider.get({}).then(async (categorias: any) => {
                this.categorias = categorias;
            }).catch(error => {
                if (error) {
                    this.toastCtrl.danger('Ha ocurrido un error al obtener las categorías.');
                }
            });
        });
    }

    verCategoria(categoria) {
        this.router.navigate(['historia-salud/detalle'], { queryParams: { categoria: JSON.stringify(categoria) } });
    }

}
