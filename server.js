const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const moment = require('moment'); 
const { optionsMySQL } = require( './options/DBs.js')
const { optionsSQLite } = require( './options/DBs.js')
const Contenedor = require('./src/contenedores/Contenedor.js');
const { json } = require('express');
const ApiProductosMock = require('./mocks/api/productos.js')
const handlebars = require('express-handlebars');
const { normalize, schema } = require("normalizr");

const contChat = new Contenedor(optionsSQLite)
const contProd = new Contenedor(optionsMySQL)

const fecha = moment().format("DD/MM/YYYY HH:mm:ss"); 

const session = require('express-session')
/* ------------------------------------------------*/
/*           Persistencia por MongoDB              */
/* ------------------------------------------------*/
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
/* ------------------------------------------------*/

const app = express()

app.use(session({
    /* ----------------------------------------------------- */
    /*           Persistencia por redis database             */
    /* ----------------------------------------------------- */
    store: MongoStore.create({
        //En Atlas connect App :  Make sure to change the node version to 2.2.12:
       // mongoUrl: 'mongodb://daniel:daniel123@cluster0-shard-00-00.nfdif.mongodb.net:27017,cluster0-shard-00-01.nfdif.mongodb.net:27017,cluster0-shard-00-02.nfdif.mongodb.net:27017/sesiones?ssl=true&replicaSet=atlas-bwvi2w-shard-0&authSource=admin&retryWrites=true&w=majority',
        mongoUrl:'mongodb://kenny1698:kenny1698@cluster0-shard-00-00.g7tte.mongodb.net:27017,cluster0-shard-00-01.g7tte.mongodb.net:27017,cluster0-shard-00-02.g7tte.mongodb.net:27017/sesiones?ssl=true&replicaSet=atlas-13vjwv-shard-0&authSource=admin&retryWrites=true&w=majority',
       mongoOptions: advancedOptions
    }),
    /* ----------------------------------------------------- */

    secret: 'shhhhhhhhhhhhhhhhhhhhh',
    resave: false,
    saveUninitialized: false,
    rolling:true,
    cookie: {
        maxAge: 600000
    } 
}))


const { Router } = express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.urlencoded({ extended: true }))

app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/public/views/layouts",
        partialsDir: __dirname + "/public/views/partials"
    })
);

app.set('views', './public/views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas



const productos = []
const mensajes = []

//contChat.start()
//contProd.start()



contProd.getAll('productos')
    .then((result) =>{
        for (const obj in result) {
            productos.push(result[obj])
            }        
    })
    .catch((err) => { console.log(err); throw err })
    .finally(() => {
        //contProd.close()
    })

// console.log(productos)

contChat.getAll('chat')
     .then((result) =>{
        for (const obj in result) {
            mensajes.push(result[obj])
            }    
     })
    .catch((err) => { console.log(err); throw err })
    .finally(() => {
        //contProd.close()
    })

const ApiProductos = new ApiProductosMock()
const productosFakes = ApiProductos.listar()


app.get('/api/productos-test', (req, res) => {
    res.render('tabla-productos', {productosFakes});
    
})

app.get('/login', (req, res) => {
   
        //req.session.contador = 1
        res.render('login')
})

app.post('/login', (req, res) => {
    //console.log("POST")
    //console.log(req.body.nombre)
    //req.session.contador = 1
    req.session.nombre = req.body.nombre
    const nombreSesion = req.session.nombre
    res.render('index',{nombreSesion}) 
})

app.post('/logout', (req, res) => {
    const nombreSesion = req.session.nombre
    req.session.destroy(err => {
        if (!err) res.send('Logout ok!')
        else res.send({ status: 'Logout ERROR', body: err })
    })
    res.render('logout',{nombreSesion})      
})

app.use(express.static('public'));

io.on('connection',async socket => {
    console.log('Nuevo cliente conectado!')

    /* Envio los mensajes al cliente que se conectó */
    const chatMensajes = {id:'mensajes', mensajes:mensajes}
    // const chatMensajes = {
    //     id: 'mensajes',
    //     mensajes: [{
    //             id: 1,
    //             fecha: '02/11/2021 11:13:26',
    //             author: {email:"d@s",nombre:"Daniel",apellido:"Sanchez",alias:"Dani",avatar:"avatar1"},
    //             text: 'Hola'
    //         },
    //         {
    //             id: 2,
    //             fecha: '02/11/2021 11:13:26',
    //             author: {email:"d@s",nombre:"Daniel",apellido:"Sanchez",alias:"Dani",avatar:"avatar1"},
    //             text: 'Chau'
    //         }
    //     ]
    // }

    const authorSchema = new schema.Entity('authors');
    const chatSchema = new schema.Entity('chat', {
    author: authorSchema,
    });

    const normalizedChat= normalize(chatMensajes, chatSchema)
    //console.log(JSON.stringify(normalizedChat))
    //console.log(JSON.stringify(normalizedChat).length)

    socket.emit('mensajes', normalizedChat)
    //console.log(chatMensajes)
    //console.log(JSON.stringify(chatMensajes).length)

    // /* Escucho los mensajes enviado por el cliente y se los propago a todos */
    
    socket.on('mensaje',  data =>  {
        try {
            //console.log(JSON.stringify(data.author))
            const msj = {fecha, author: JSON.stringify(data.author), text:data.text}
            mensajes.push(msj)
            io.sockets.emit('mensajes', mensajes) 
            //console.log(msj)
            contChat.save(msj, 'chat')
            .then(() => {
               return 
            })
            .catch((err) => { console.log(err); throw err })
            .finally(() => {
                //contProd.close()
            })
        } catch(err) {
            console.log(err)  
        }
    })

    socket.emit('productos', productos)
    //socket.emit('productos', productos)

    socket.on('producto', data => {
        try {
            productos.push(data)
            io.sockets.emit('productos', productos)
            contProd.save([data], 'productos')
            .then(() => {
               return 
            })
            .catch((err) => { console.log(err); throw err })
            .finally(() => {
                //contProd.close()
            })
            
        } catch(err) {
            console.log(err)  
        }
       
    })
    
})

const PORT = 8080
const connectedServer = httpServer.listen(PORT, function () {
    console.log(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
})
connectedServer.on('error', error => console.log(`Error en servidor ${error}`))