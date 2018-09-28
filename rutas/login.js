'use strict';
// Requires
var express = require('express');
var Usuario = require('../modelos/usuario');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Variables
var app = express();
var saltRounds = 10;


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



//================================================================
// Autentificación google
//================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}
app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch(e => {

        return res.status(403).json({
            ok: false,
            mensaje: 'Token Inválido',

        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la búsqueda de usuarios:',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autentificación normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login post correcto',
                    usuarioBd: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.apellido1 = " ";
            usuario.img = googleUser.img;
            usuario.email = googleUser.email;
            usuario.password = ":)";
            usuario.google = true;

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la Grabación del usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login post correcto',
                    usuarioBd: usuarioDB,
                    token: token,
                    id: usuarioDB._id,

                });

            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Ok!:',
    //     googleUser: googleUser

    // });

});




//================================================================
// Autentificación normal
//================================================================
app.post('/', (req, res) => {
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