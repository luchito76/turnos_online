import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';

// providers
import { NetworkProvider } from './network';

@Injectable()
export class TurnosProvider {
  public user: any;
  private baseUrl = 'modules/mobileApp';

  constructor(
    public network: NetworkProvider) {
  }

  get(params) {
    return this.network.get(this.baseUrl + '/turnos', params);
  }

  getUbicacionTurno(id) {
    return this.network.get(this.baseUrl + '/turnos/ubicacion/organizacion/' + id);
  }

  cancelarTurno(body) {
    return this.network.post(this.baseUrl + '/turnos/cancelar', body, {}).then(resultado => {
      return Promise.resolve(resultado);
    }).catch(err => Promise.reject(err))
  }

  confirmarTurno(body) {
    return this.network.post(this.baseUrl + '/turnos/confirmar', body, {});
  }

  obtenerTurno(body) {
    return this.network.post(this.baseUrl + '/turnos/obtener', body, {});
  }

  confirmarAsistenciaTurno(body) {
    return this.network.post(this.baseUrl + '/turnos/asistencia', body, {});
  }
}

