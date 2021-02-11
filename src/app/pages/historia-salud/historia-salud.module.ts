import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

import { HistoriaSaludPageRoutingModule } from './historia-salud-routing.module';

import { HistoriaSaludPage } from './historia-salud.page';
import { CategoriasProvider } from 'src/providers/historia-salud/categorias';
import { DetalleCategoriaPage } from './categorias/detalle-categoria';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoriaSaludPageRoutingModule,
  ],
  providers: [
    CategoriasProvider,
    FileTransfer,
    FileOpener
  ],
  declarations: [
    HistoriaSaludPage,
    DetalleCategoriaPage
  ]
})
export class HistoriaSaludPageModule { }
