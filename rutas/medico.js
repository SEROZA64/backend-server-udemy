// Requieries

var express = require('express');

var Medico = require('../modelos/medico');

var mdAutenticacion = require('../middlewares/autenticacion');


// Variables
var app = express();


// =============================
// Obtener todos los Medicos
// =============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}).
    skip(desde).
    limit(3).
    populate('usuario', 'nombre apellido1 apellido2 email').
    populate('hospital').
    exec((err, medicos) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en la carga de medicos:',
                errors: err
            });
        }


        Medico.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                totalMedicos: conteo,
                medicos: medicos
            });


        });
    });


});






// =============================
// Actualizar un nuevo Medico
// =============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) =>

    {
        var id = req.params.id;
        var body = req.body;

        Medico.findById(id, (err, medicos) => {

            if (err) {
                return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la búsqueda del medicos:',
                        errors: err
                    }

                );
            }
            if (!medicos) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en la búsqueda del medicos: El medicos con el id ' + id + ' No existe',
                    errors: { message: 'No existe un medicos con el ID indicado' }
                });
            }

            medicos.nombre = body.nombre;
            medicos.img = body.img;
            medicos.usuario = req.usuario._id;
            medico.hospital = body.hospital._id;

            medicos.save((err, medicosGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error en la actualización del medicos:',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medicos: medicosGuardado
                });

            });

        });
    });


// =============================
// Crear un nuevo medicos
// =============================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicosGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la creación del medicos:',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicosGuardado,
        });

    });


});



// =============================
// Eleminar medicos
// =============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicosBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el medicos:',
                errors: err
            });
        }
        if (!medicosBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ningun medicos con el id:' + id,
                errors: { message: 'No existe ningun medicos con el Id:' + id }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicosBorrado
        });

    });
});





module.exports = app;