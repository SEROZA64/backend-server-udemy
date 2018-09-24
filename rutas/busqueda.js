// Requieries
var express = require('express');


// Variables
var app = express();

// Importamos los modelos
var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');
var Usuario = require('../modelos/usuario');

// ===================================
//
// Búsqueda epecifica por collección
//
//====================================
// Rutas
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    // Obtenemos la tabla de la url enviada
    var tabla = req.params.tabla;

    // Obtenemos la busqueda de la url enviada
    var busqueda = req.params.busqueda;

    // Declaramos la variable promesa que será la promesa a ejecutar
    var promesa;

    // Declaramos la expresión Regular
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;

        default:
            // Imprimimos la respuesta
            return res.status(400).json({
                ok: false,
                mensaje: 'Ha ocurrido un error: Los tipos de tabla son:  usuario, medico y hospital',
                error: { mensaje: 'Tipo de tabla colección inválido' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


// ======================
//
// Búsqueda general
//
//======================

// Rutas
app.get('/todo/:busqueda', (req, res, next) => {

    // Obtenemos el parámetro Busqueda de la url
    var busqueda = req.params.busqueda;

    // Expresión regular para evitar el casesensitive
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex),
        ])
        .then(respuestas => {
            // Imprimimos la respuesta
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        }).catch(err => {
            // Imprimimos la respuesta
            res.status(500).json({
                ok: false,
                mensaje: 'Ha ocurrido un error:',
                error: { message: 'Error en la promesa de busqueda por todas las colecciones' }
            });
        });

});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        // Realizamos el query
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre apellido1 apellido2 email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error en la carga de Hospitales ', err);
                } else {
                    resolve(hospitales);
                }

            });

    });

}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        // Realizamos el query
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre apellido1 apellido2 email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error en la carga de Medicos ', err);
                } else {
                    resolve(medicos);
                }

            });

    });

}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {

        // Realizamos el query
        Usuario.find({}, 'nombre apellido1 apellido2 email')
            .or([{ 'nombre': regex }, { 'apellido1': regex }, { 'apellido2': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error en la carga de Usuarios ', err);
                } else {
                    resolve(usuarios);
                }

            });

    });

}


module.exports = app;