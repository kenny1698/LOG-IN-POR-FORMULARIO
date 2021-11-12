const optionsMySQL = {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mariadb'
    }
}

const optionsSQLite = {
    client: 'sqlite3',
    connection: {
      filename: "./DB/ecommerce.sqlite"
    },
    useNullAsDefault: true
  }

module.exports = {optionsMySQL, optionsSQLite}