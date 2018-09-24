// Requieries
var express = require('express');
var fileUpload = require('express-fileupload');

// Importamos el File System para el manejo de ficheros
var fs = require('fs');

// Importamos los modelos

var Usuario = require('../modelos/usuario');
var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');


// Variables
var app = express();

// middelware
app.use(fileUpload());


// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    // Obtenemos el tipo pasado por url (Médico, Hospital o Uusario)
    var tipo = req.params.tipo;

    // Obtenemos el id pasado por url
    var id = req.params.id;

    // Si no hay fichero selecionado
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error en la carga. No se selecciono ningún archivo',
            errors: { mensaje: 'Debe selecionar una imagen' }
        });
    }

    //Obtenemos el nombre del archivo
    var archivo = req.files.img;
    var archivoCortado = archivo.name.split('.');
    var extensionArchivo = archivoCortado[archivoCortado.length - 1];

    // Extensiones que admitimos
    var extensionesPermitidas = ['png', 'jpg', 'gif', 'ico', 'bmp', 'jpeg'];

    // Colecciones disponibles
    var tiposColeccion = ['hospitales', 'medicos', 'usuarios'];

    // Si la colección no está entre las permitidas
    if (tiposColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error en la carga. No existe la colección: ' + tipo,
            errors: { mensaje: 'Debe selecionar una colección válida entre ' + tiposColeccion.join(', ') }
        });
    }

    // Si la extensión no está entre las permitidas
    if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error en la carga. El archivo seleccionado no corresponde con una imagen permitida',
            errors: { mensaje: 'Debe selecionar una imagen en formato ' + extensionesPermitidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // id - número aleatorio.extension
    var archivoPersonalizado = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo a un directorio específico
    path = `./uploads/${ tipo }/${ archivoPersonalizado }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, archivoPersonalizado, res);


        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido correctamente',
        //     archivoCortado: archivoCortado,
        //     extensionArchivo: extensionArchivo


        // });

    });

});


function subirPorTipo(tipo, id, archivoPersonalizado, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un usuario con el id ' + id,
                    errors: err
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;



            // Si existe el fichero
            if (fs.existsSync(pathViejo)) {
                // Borramos el archivo anterior
                fs.unlink(pathViejo);
            }

            // Guaradamos el nombre de la imagen en la base de datos
            usuario.img = archivoPersonalizado;
            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Existe un problema en la actualización del usuario con el id ' + id,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada correctamente',
                    usuario: usuarioActualizado
                });


            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un medico con el id ' + id,
                    errors: err
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe el fichero
            if (fs.existsSync(pathViejo)) {
                // Borramos el archivo anterior
                fs.unlink(pathViejo);
            }

            // Guaradamos el nombre de la imagen en la base de datos
            medico.img = archivoPersonalizado;
            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Existe un problema en la actualización del medico con el id ' + id,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizada correctamente',
                    medico: medicoActualizado
                });


            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe un hospital con el id ' + id,
                    errors: err
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;



            // Si existe el fichero
            if (fs.existsSync(pathViejo)) {
                // Borramos el archivo anterior
                fs.unlink(pathViejo);
            }

            // Guaradamos el nombre de la imagen en la base de datos
            hospital.img = archivoPersonalizado;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Existe un problema en la actualización del hospital con el id ' + id,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizada correctamente',
                    hospital: hospitalActualizado
                });


            });
        });
    }
}

module.exports = app;