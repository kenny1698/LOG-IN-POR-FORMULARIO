const faker = require('faker')

faker.locale = 'es'

const getProductos = () => {
    return {
        nombre: faker.commerce.productName(),
        precio: faker.commerce.price(),
        url: faker.random.image()
    }
}

module.exports = getProductos 