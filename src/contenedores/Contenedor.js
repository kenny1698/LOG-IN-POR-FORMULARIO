//import knexLib from 'knex'
const knexLib = require('knex')

class Contenedor {
    constructor(config) {
        this.knex = knexLib(config)
    }
    startProductos() {
        return this.knex.schema.dropTableIfExists('productos')
          .finally(() => {
            return this.knex.schema.createTable('productos', table => {
              table.increments('id').primary();
              table.string('nombre', 50).notNullable();
              table.float('precio').notNullable();
              table.string('url', 250).notNullable();
            })
          })
    }
    startChat() {
             return this.knex.schema.dropTableIfExists('chat')
          .finally(() => {
             return this.knex.schema.createTable('chat', table => {
               table.increments('id').primary()
               table.string('fecha', 50).notNullable()
               table.jsonb('author').notNullable()
               table.string('text').notNullable()
             })
          })
    }
    save(obj, tabla){
        console.log(obj)
        try {
             return this.knex(tabla).insert(obj)
        } catch(err) {
            console.log(err)  
        }
    }

    getAll(tabla){            
            try {
                return this.knex(tabla).select('*')
            } catch(err) {
                console.log(err)  
            }
    }
    getById(id, tabla){
        try {
            return this.knex(tabla).select('*').where('id', id) 
        } catch(err) {
            console.log(err)  
        }
    }
    deleteById(id){
        try {
            return this.knex.from('productos').where('id', id).del()
        } catch(err) {
            console.log(err)  
        }
    }
     deleteAll(){
        try {
            return this.knex.from('productos').del()
        } catch(err) {
            console.log(err)  
        }
    }
  getByIdRandom(){
        try {
            // const data = fs.readFileSync(this.filename, 'utf-8')
            // const dataLength = JSON.parse(data).length
            // const random = Math.floor(Math.random()*(dataLength+1))
            // return JSON.parse(data)[random-1]
            
        } catch(err) {
            console.log(err)  
        }
    }
    close() {
        this.knex.destroy();
    }
}

module.exports = Contenedor