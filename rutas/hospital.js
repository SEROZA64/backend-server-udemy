// Requieries

var express = require('express');

var Hospital = require('../modelos/hospital');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');


// Variables
var app = express();


// =============================
// Obtener todos los Hospitales
// =============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}).
    skip(desde).
    limit(3).
    populate('usuario', 'nombre apellido1 apellido2 email').
    exec((err, hospitales) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en la carga de hospitales:',
                errors: err
            });
        }

        Hospital.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                totalHopitales: conteo,
                hospitales: hospitales
            });


        });

    });


});






// =============================
// Actualizar un nuevo Hospital
// =============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) =>

    {
        var id = req.params.id;
        var body = req.body;

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la búsqueda del hospital:',
                        errors: err
                    }

                );
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en la búsqueda del hospital: El hospital con el id ' + id + ' No existe',
                    errors: { message: 'No existe un hospital con el ID indicado' }
                });
            }

            hospital.nombre = body.nombre;
            hospital.img = body.img;
            hospital.usuario = req.usuario._id;

            hospital.save((err, hospitalGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error en la actualización del hospital:',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });

            });

        });
    });


// =============================
// Crear un nuevo hospital
// =============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la creación del hospital:',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });


});



// =============================
// Eleminar hospital
// =============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el hospital:',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ningun hospital con el id:' + id,
                errors: { message: 'No existe ningun hospital con el Id:' + id }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});





module.exports = app;