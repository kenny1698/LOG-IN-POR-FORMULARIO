const socket = io();

const authorSchema = new normalizr.schema.Entity('authors');
const chatSchema = new normalizr.schema.Entity('chat', {
  author: authorSchema,
});

const email = document.getElementById("email")
const chat = document.getElementById("chat")

const formMensajeChat = document.getElementById('formMensajeChat')
formMensajeChat.addEventListener('submit', e => {
    e.preventDefault()
    
    socket.emit("mensaje",{
        author    :   {
            id        :   email.value,
            nombre    :   nombreM.value,
            apellido  :   apellido.value,
            edad      :   edad.vaule,
            alias     :   alias.value,
            avatar    :   avatar.value 
        },
        text          : chat.value
    });
    
})

socket.on('mensajes', cargarChat)

async function cargarChat(mensajes){
    const msjs = normalizr.denormalize(mensajes.result, chatSchema, mensajes.entities);
    console.log(msjs.mensajes)
    const mensajesHTML = msjs.mensajes
        .map(msj => `<label style="font-weight: bold; color:Blue;">${JSON.parse(msj.author).id}</label>
        <label style="font-style: normal; color:Brown;">[${msj.fecha}] </label>
        <label style="font-style: italic; color:Green;">${msj.text} </label>
        <img src=${JSON.parse(msj.author).avatar} width="60" height="60">`)
        .join('<br>')
    document.getElementById('chatMensajes').innerHTML = mensajesHTML
    chat.value =""    
}

const nombre = document.getElementById("nombre")
const precio = document.getElementById("precio")
const url = document.getElementById("url")


const formListaProductos = document.getElementById('formListaProductos')
formListaProductos.addEventListener('submit', e => {
    e.preventDefault()
    
    socket.emit('producto', { 
        "nombre"    : nombre.value,
        "precio"    : parseFloat(precio.value),
        "url"       : url.value
    });
    formListaProductos.reset()
})

socket.on('productos', EventoProdutos);

async function EventoProdutos(productos) {
     console.log(productos)

    // busco la plantilla del servidor
    const recursoRemoto = await fetch('plantillas/tabla-productos.hbs')

    //extraigo el texto de la respuesta del servidor
    const textoPlantilla = await recursoRemoto.text()

    //armo el template con handlebars
    const functionTemplate = Handlebars.compile(textoPlantilla)

    // relleno la plantilla con las personas recibidas
    const html = functionTemplate({ productos })

    // reemplazo el contenido del navegador con los nuevos datos
    document.getElementById('productos').innerHTML = html
}