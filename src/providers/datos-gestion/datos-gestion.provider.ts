import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import * as moment from 'moment';
import { NetworkProvider } from '../../providers/network';
import { RupConsultorioPage } from 'pages/profesional/consultorio/rup-consultorio';

@Injectable()
export class DatosGestionProvider {
    private baseUrl = 'modules/mobileApp/problemas';

    db: SQLiteObject = null;

    constructor(public network: NetworkProvider) { }


    setDatabase(db: SQLiteObject) {
        if (this.db === null) {
            this.db = db;
        }
    }


    async insertProblemas(tupla: any, adjuntos, origen, descripcionOrigen) {
        let sql = `INSERT INTO problemas(quienRegistra, responsable,problema,estado,origen,descripcionOrigen,vencimientoPlazo,referenciaInforme,fechaRegistro,necesitaActualizacion)
        VALUES(?,?,?,?,?,?,?,?,?,?)`;

        try {
            let row = await this.db.executeSql(sql, [tupla.quienRegistra, tupla.responsable, tupla.problema, tupla.estado.toLowerCase(), origen, descripcionOrigen, tupla.plazo, tupla.referenciaInforme, tupla.fechaRegistro, 1]);
            for (let index = 0; index < adjuntos.length; index++) {
                const element = adjuntos[index];
                let sqlImg = `INSERT INTO imagenesProblema(ID_IMAGEN, BASE64, ID_PROBLEMA) VALUES (?,?,?)`;
                this.db.executeSql(sqlImg, [null, element, row.insertId])
            }

            let respuesta = {
                quienRegistra: tupla.quienRegistra,
                responsable: tupla.responsable,
                problema: tupla.problema,
                estado: tupla.estado.toLowerCase(),
                origen: origen,
                descripcionOrigen: descripcionOrigen,
                plazo: tupla.plazo,
                referenciaInforme: tupla.referenciaInforme,
                fechaRegistro: tupla.fechaRegistro,
                adjuntos: adjuntos,
                idProblema: row.insertId
            }
            return respuesta;

        } catch (err) {
            return (err);
        }
    }

    createTable() {
        let sql = 'CREATE TABLE IF NOT EXISTS datosGestion(idEfector INTEGER, Efector VARCHAR(200), IdEfectorSuperior INTEGER, IdLocalidad INTEGER, ' +
            'Localidad  VARCHAR(400), IdArea INTEGER, Area VARCHAR(200), IdZona integer, Zona VARCHAR(200), ' +
            'NivelComp VARCHAR(50), Periodo DATE,' +
            'Guardia_con INTEGER, Egresos INTEGER, Total_TH  INTEGER,TH_Oper INTEGER,TH_Tec INTEGER,TH_Prof INTEGER,TH_Asis INTEGER,' +
            'TH_Admin INTEGER, TH_Medicos INTEGER,  TH_Ped INTEGER, TH_MG INTEGER,  TH_CL INTEGER, TH_Toco INTEGER,TH_Enf INTEGER, INV_GastoPer INTEGER, ' +
            'INV_BienesUso INTEGER, INV_BienesCons INTEGER, INV_ServNoPers INTEGER,' +
            'RED_Complejidad INTEGER, RED_Centros INTEGER, RED_PuestosSanit INTEGER,' +
            'RED_Camas INTEGER, Vehiculos INTEGER, OB_Monto INTEGER, OB_Detalle INTEGER, ' +
            'OB_Estado INTEGER, SD_Poblacion INTEGER, SD_Mujeres INTEGER, SD_Varones INTEGER, SD_Muj_15a49 INTEGER, SD_Menores_6 INTEGER,' +
            'PROD_Consultas INTEGER, PROD_ConGuardia INTEGER, PROD_PorcConGuardia INTEGER, PROD_Egresos INTEGER, updated DATETIME)';
        try {
            return this.db.executeSql(sql, []);
        } catch (err) {
            return (err);
        }
    }
    createTableProf() {
        let sql = 'CREATE TABLE IF NOT EXISTS profesionales(LUGARPAGO VARCHAR(255), NRO_LIQ FLOAT, FECHA_LIQ DATE,' +
            'SERVICIO  VARCHAR(100), UO VARCHAR(100), LEGAJO INTEGER, SUBCONTRATO INTEGER,APENOM VARCHAR(100), ' +
            'ESPECIALIDAD VARCHAR(100), UBIGEO VARCHAR(100),' +
            'CAT_AGRUPA_CARGOS VARCHAR(100),CATEGORIA_COD VARCHAR(3), CATEGORIA_DESC VARCHAR(100),' +
            'CPN1 INTEGER, CPN2 INTEGER, CPN3 INTEGER, PROGRAMA VARCHAR (150),ESTADO_PUESTO VARCHAR(50),' +
            'CUIL VARCHAR(40),NRO_DOC VARCHAR(40),ANIO_NAC INTEGER, IdEfector INTEGER,' +
            'CANTIDAD FLOAT,  IdArea INTEGER, updated DATETIME)';
        try {
            return this.db.executeSql(sql, []);

        } catch (err) {
            return (err);
        }
    }
    createTableRegistroProblemas() {
        let sql = 'CREATE TABLE IF NOT EXISTS problemas(idProblema INTEGER PRIMARY KEY AUTOINCREMENT,quienRegistra, responsable ,problema,estado,origen,descripcionOrigen,referenciaInforme VARCHAR(255), vencimientoPlazo, fechaRegistro DATETIME, necesitaActualizacion BOOLEAN' + ')';
        try {
            return this.db.executeSql(sql, []);

        } catch (err) {
            return (err);
        }
    }

    createTableImagenesProblema() {
        let sql = 'CREATE TABLE IF NOT EXISTS imagenesProblema(ID_IMAGEN INTEGER PRIMARY KEY AUTOINCREMENT, BASE64 VARCHAR(8000), ID_PROBLEMA INTEGER, FOREIGN KEY(ID_PROBLEMA) REFERENCES problemas(ID_PROBLEMA) ' + ')';
        try {
            return this.db.executeSql(sql, []);

        } catch (err) {
            return (err);
        }
    }
    insertMultiple(datos: any) {
        let insertRows = [];
        let updated = moment().format('YYYY-MM-DD HH:mm');
        datos.forEach(tupla => {
            insertRows.push([
                `INSERT INTO datosGestion(idEfector, Efector, IdEfectorSuperior, IdLocalidad, Localidad, IdArea, Area, IdZona, Zona, NivelComp, Periodo,
                    Total_TH,TH_Oper,TH_Tec,TH_Prof,TH_Asis,TH_Admin, TH_Medicos,TH_Ped,TH_MG,TH_CL,TH_Toco, TH_Enf, INV_GastoPer,INV_BienesUso, INV_BienesCons, INV_ServNoPers, RED_Complejidad, RED_Centros, RED_PuestosSanit,
                RED_Camas, Vehiculos, OB_Monto, OB_Detalle,OB_Estado, SD_Poblacion, SD_Mujeres, SD_Varones, SD_Muj_15a49, SD_Menores_6,
                PROD_Consultas, PROD_ConGuardia, PROD_PorcConGuardia, PROD_Egresos, updated)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [tupla.idEfector, tupla.Efector, tupla.IdEfectorSuperior, tupla.IdLocalidad, tupla.Localidad, tupla.IdArea, tupla.Area, tupla.IdZona, tupla.Zona, tupla.NivelComp, tupla.Periodo,
                tupla.Total_TH, tupla.TH_Oper, tupla.TH_Tec, tupla.TH_Prof, tupla.TH_Asis, tupla.TH_Admin, tupla.TH_Medicos, tupla.TH_Ped, tupla.TH_MG, tupla.TH_CL, tupla.TH_Toco, tupla.TH_Enf, tupla.INV_GastoPer, tupla.INV_BienesUso,
                tupla.INV_BienesCons, tupla.INV_ServNoPers, tupla.RED_Complejidad, tupla.RED_Centros, tupla.RED_PuestosSanit,
                tupla.RED_Camas, tupla.Vehiculos, tupla.OB_Monto, tupla.OB_Detalle, tupla.OB_Estado, tupla.SD_Poblacion, tupla.SD_Mujeres,
                tupla.SD_Varones, tupla.SD_Muj_15a49, tupla.SD_Menores_6, tupla.PROD_Consultas, tupla.PROD_ConGuardia,
                tupla.PROD_PorcConGuardia, tupla.PROD_Egresos, updated]
            ]);
        });
        return this.db.sqlBatch(insertRows);
    }

    insertMultipleProf(datosProf: any) {
        let insertRows = [];
        let updated = moment().format('YYYY-MM-DD HH:mm');
        datosProf.forEach(tupla => {
            insertRows.push([
                `INSERT INTO profesionales(LUGARPAGO, NRO_LIQ, FECHA_LIQ, SERVICIO, UO, LEGAJO,
                    SUBCONTRATO,
                    APENOM, ESPECIALIDAD,
                    UBIGEO, CAT_AGRUPA_CARGOS,
                    CATEGORIA_COD,CATEGORIA_DESC,CPN1,CPN2,CPN3,PROGRAMA,
                    ESTADO_PUESTO, CUIL,NRO_DOC, ANIO_NAC,CANTIDAD, IdEfector,IdArea,updated)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [tupla.LUGARPAGO, tupla.NRO_LIQ, tupla.FECHA_LIQ,
                tupla.SERVICIO, tupla.UO, tupla.LEGAJO,
                tupla.SUBCONTRATO, tupla.APENOM, tupla.ESPECIALIDAD, tupla.UBIGEO, tupla.CAT_AGRUPA_CARGOS,
                tupla.CATEGORIA_COD, tupla.CATEGORIA_DESC, tupla.CPN1, tupla.CPN2, tupla.CPN3, tupla.PROGRAMA,
                tupla.ESTADO_PUESTO, tupla.CUIL, tupla.NRO_DOC, tupla.ANIO_NAC,
                tupla.CANTIDAD, tupla.IdEfector, tupla.IdArea, updated]
            ]);
        });
        return this.db.sqlBatch(insertRows);
    }

    delete() {
        let sql = 'DELETE FROM datosGestion';
        try {
            this.db.executeSql(sql, []);
            this.db.executeSql('VACUUM', []);
        } catch (err) {
            return (err);
        }

    }
    deleteProf() {
        let sql = 'DELETE FROM profesionales';
        try {
            this.db.executeSql(sql, []);
            this.db.executeSql('VACUUM', []);
        } catch (err) {
            return (err);
        }

    }

    limpiar() {
        let sql = 'DELETE FROM problemas';
        try {
            return this.db.executeSql(sql, []);
        } catch (err) {
            return (err);
        }

    }

    limpiarImagenes() {
        let sql = 'DELETE FROM imagenesProblema';
        try {
            return this.db.executeSql(sql, []);
        } catch (err) {
            return (err);
        }

    }

    obtenerDatos() {
        let sql = 'SELECT * FROM datosGestion';
        return this.db.executeSql(sql, [])
            .then(response => {
                let datos = [];
                for (let index = 0; index < response.rows.length; index++) {
                    datos.push(response.rows.item(index));
                }
                return Promise.resolve(datos);
            })
            .catch(error => error);
    }
    obtenerDatosProf() {
        let sql = 'SELECT * FROM profesionales';
        return this.db.executeSql(sql, [])
            .then(response => {
                let datos = [];

                for (let index = 0; index < response.rows.length; index++) {
                    datos.push(response.rows.item(index));
                }
                return Promise.resolve(datos);
            })
            .catch(error => error);
    }

    obtenerListadoProblemas() {
        let sql = 'SELECT * FROM problemas';
        return this.db.executeSql(sql, [])
            .then(response => {
                let datos = [];

                for (let index = 0; index < response.rows.length; index++) {
                    datos.push(response.rows.item(index));
                }
                return Promise.resolve(datos);
            })
            .catch(error => { return error });
    }
    obtenerImagenes() {
        let sql = 'SELECT * FROM imagenesProblema';
        return this.db.executeSql(sql, [])
            .then(response => {
                let datos = [];

                for (let index = 0; index < response.rows.length; index++) {
                    datos.push(response.rows.item(index));
                }
                return Promise.resolve(datos);
            })
            .catch(error => { return error });
    }

    obtenerImagenesProblemasPorId(id) {
        let sql = 'SELECT * FROM imagenesProblema where  ID_PROBLEMA = ' + id + ' ';
        return this.db.executeSql(sql, [])
            .then(response => {
                let datos = [];

                for (let index = 0; index < response.rows.length; index++) {
                    datos.push(response.rows.item(index));
                }
                return Promise.resolve(datos);
            })
            .catch(error => { return error });
    }


    update(task: any) {
        let sql = 'UPDATE datosGestion SET title=?, completed=? WHERE id=?';
        try {
            return this.db.executeSql(sql, [task.title, task.completed, task.id]);
        } catch (err) {
            return (err);
        }
    }

    updateEstadoProblema(task: any) {
        console.log('updateEstadoProblema: ', task);
        let sql = 'UPDATE problemas SET estado=? WHERE idProblema=?';
        try {
            return this.db.executeSql(sql, [task.estado, task.idProblema]);
        } catch (err) {
            return (err);
        }
    }

    updateEstadoActualizacion(task) {
        console.log('updateEstadoActualizacion: ', task);
        let sql = 'UPDATE problemas SET necesitaActualizacion=? WHERE idProblema=?';
        try {
            return this.db.executeSql(sql, [0, task.idProblema]);
        } catch (err) {
            return (err);
        }
    }
    async migrarDatos(params: any) {
        let migro = false;
        let migroProf = false;
        try {
            // let datos: any = await this.network.get('modules/mobileApp/datosGestion', params)
            // let datos: any = await this.network.get('mobile/migrar', params)
            let datos: any = await this.network.getMobileApi('mobile/migrar', params)
            let cant = datos ? datos.lista.length : 0;
            if (cant > 0) {
                await this.delete();
                await this.insertMultiple(datos.lista);
                migro = true;


            }
            let cantProf = datos ? datos.listaProf.length : 0;
            if (cantProf > 0) {
                await this.deleteProf();
                await this.insertMultipleProf(datos.listaProf);
                migroProf = true;

            }
            if (migro && migroProf) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return (error);
        }

    }

    async executeQuery(query) {
        try {
            let datos = await this.db.executeSql(query, []);
            let rta = [];
            if (datos && datos.rows) {
                for (let index = 0; index < datos.rows.length; index++) {
                    rta.push(datos.rows.item(index));
                }
            }
            return rta;
        } catch (err) {
            return (err);
        }

    }


    // async localidadesPorZona(idZona) {
    //     try {
    //         let query = 'SELECT DISTINCT IdLocalidad,Localidad FROM datosGestion where IdZona=' + idZona;
    //         let datos = await this.db.executeSql(query, []);
    //         let rta = [];
    //         // let rta = datos.rows.item(0);
    //         for (let index = 0; index < datos.rows.length; index++) {
    //             rta.push(datos.rows.item(index));
    //         }
    //         return rta;
    //     } catch (err) {
    //         return (err);
    //     }

    // }
    async areasPorZona(idZona) {
        try {
            let query = 'SELECT DISTINCT IdArea,Area FROM datosGestion where IdZona=' + idZona;
            let datos = await this.db.executeSql(query, []);
            let rta = [];
            for (let index = 0; index < datos.rows.length; index++) {
                rta.push(datos.rows.item(index));
            }
            return rta;
        } catch (err) {
            return (err);
        }

    }
    // async efectoresPorLocalidad(id) {
    //     try {
    //         let query = 'SELECT DISTINCT IdEfector, Efector FROM datosGestion where IdLocalidad=' + id;
    //         let datos = await this.db.executeSql(query, []);
    //         let rta = [];
    //         for (let index = 0; index < datos.rows.length; index++) {
    //             rta.push(datos.rows.item(index));
    //         }
    //         return rta;
    //     } catch (err) {
    //         return (err);
    //     }
    // }

    async efectoresPorZona(id) {
        try {
            let query = 'SELECT DISTINCT idEfector, Efector FROM datosGestion where IdArea=' + id;
            let datos = await this.db.executeSql(query, []);
            let rta = [];
            for (let index = 0; index < datos.rows.length; index++) {
                rta.push(datos.rows.item(index));
            }
            return rta;
        } catch (err) {
            return (err);
        }
    }

    // Actualiza la DB de mongo con los reportes nuevos o modificados (necesitaActualizacion === 1)
    async sqlToMongoProblemas() {
        try {
            let listado = await this.obtenerListadoProblemas()
            let resultadoBusqueda = listado.filter(item => item.necesitaActualizacion === 1);
            console.log(resultadoBusqueda)
            for (let index = 0; index < resultadoBusqueda.length; index++) {
                resultadoBusqueda[index].estado = resultadoBusqueda[index].estado.toLowerCase();
                //    let element = resultadoBusqueda[index];
                const element = {
                    idProblema: resultadoBusqueda[index].idProblema,
                    quienRegistra: resultadoBusqueda[index].quienRegistra,
                    responsable: resultadoBusqueda[index].responsable,
                    problema: resultadoBusqueda[index].problema,
                    estado: resultadoBusqueda[index].estado,
                    origen: resultadoBusqueda[index].origen,
                    descripcionOrigen: resultadoBusqueda[index].descripcionOrigen,
                    plazo: resultadoBusqueda[index].vencimientoPlazo,
                    referenciaInforme: resultadoBusqueda[index].referenciaInforme,
                    fechaRegistro: resultadoBusqueda[index].fechaRegistro
                }

                // VER ADJUNTOS Y PONER 'NECESITAACTUALIZACION' EN CERO!!

                console.log('sqlToMongoProblemas inserta: ', element);
                // inserta en mongo
                this.postMongoProblemas(element)
            }
            // this.mongoToSqlProblemas()
            return listado;
        } catch (err) {
            return (err);
        }
    }

    async mongoToSqlProblemas() {
        console.log('mongoToSqlProblemas');
        try {
            let listado: any = await this.getMongoProblemas();
            console.log(listado)
            if (listado) {
                await this.limpiar();
                await this.limpiarImagenes();
            }
            for (let index = 0; index < listado.length; index++) {
                const element = listado[index];
                // inserta en mongo
                console.log('aca')
              let a =  await this.insertProblemas(element, element.adjuntos, element.origen, element.descripcionOrigen)
              console.log(a)
            }
        } catch (err) {
            return (err);
        }
    }


    async maxPeriodo() {
        try {
            let query = 'SELECT MAX(Periodo) as Periodo FROM datosGestion';
            let datos = await this.db.executeSql(query, []);
            if (datos.rows.length) {
                return datos.rows.item(0).Periodo;
            } else {
                return null;
            }
        } catch (err) {
            return (err);
        }
    }

    getMongoProblemas() {
        return this.network.get(this.baseUrl, {});

    }

    postMongoProblemas(body) {
        console.log('servicio: ', body);
        return this.network.post(this.baseUrl + '/' + body.idProblema, body);
    }

    putMongoProblemas() {
        return this.network.put(this.baseUrl, {});
    }

}
