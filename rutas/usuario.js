// Requieries
var express = require('express');
var Usuario = require('../modelos/usuario');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');


// Variables
var app = express();


// =============================
// Obtener todos los usuarios
// =============================
app.get('/', mdAutenticacion.verificaToken, (req, res, next) => {

    Usuario.find({}, 'nombre apellido1  apellido2  role  email  img').exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en la carga de usuarios:',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });
    });


});






// =============================
// Actualizar un nuevo usuario
// =============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) =>

    {
        var id = req.params.id;
        var body = req.body;

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la búsqueda del usuario:',
                        errors: err
                    }

                );
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en la búsqueda del usuario: El usuario con el id ' + id + ' No existe',
                    errors: { message: 'No existe un usuario con el ID indicado' }
                });
            }

            usuario.nombre = body.nombre;
            usuario.apellido1 = body.apellido1;
            usuario.apellido2 = body.apellido2;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error en la actualización del usuario:',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado
                });

            });

        });
    });


// =============================
// Crear un nuevo usuario
// =============================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        apellido1: body.apellido1,
        apellido2: body.apellido2,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la creación del usuario:',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});



// =============================
// Eleminar usuario
// =============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario:',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ningun usuario con el id:' + id,
                errors: { message: 'No existe ningun usuario con el Id:' + id }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});





module.exports = app;