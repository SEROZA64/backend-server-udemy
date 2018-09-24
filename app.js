// Requieries
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar Variables
var app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'onLine');
});


// Importamos la rutas

var rutaPrincipal = require('./rutas/app');

var rutaUsuarios = require('./rutas/usuario');

var rutaLogin = require('./rutas/login');

var rutaHospital = require('./rutas/hospital');

var rutaMedico = require('./rutas/medico');

var rutaBusqueda = require('./rutas/busqueda');

var rutaUpload = require('./rutas/upload');

var rutaImagenes = require('./rutas/imagenes');

// Server-index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas (Middleware)

app.use('/usuario', rutaUsuarios);

app.use('/login', rutaLogin);

app.use('/hospital', rutaHospital);

app.use('/medico', rutaMedico);

app.use('/busqueda', rutaBusqueda);

app.use('/upload', rutaUpload);

app.use('/img', rutaImagenes);

// Nota: Esta ruta '/' debe se siempre la última ruta  
// para evitar que siempre entre por ella la primera y 
// se ignoren las demás rutas

app.use('/', rutaPrincipal);

// Ecuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'onLine');
});