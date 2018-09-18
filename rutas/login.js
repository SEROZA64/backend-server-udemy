// Requieries
var express = require('express');
var Usuario = require('../modelos/usuario');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Variables
var app = express();
const saltRounds = 10;

app.post('/', (req, res, next) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la búsqueda de usuarios:',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email:',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password:',
                errors: err
            });


        }

        // Creamos token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            usuarioBd: usuarioDB,
            token: token,
            id: usuarioDB._id
        });




    });
});

module.exports = app;