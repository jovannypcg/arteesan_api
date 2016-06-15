'use strict';

let authController = require('./../controllers/auth_controller');
let productsController = require('./../controllers/products_controller');

module.exports = function(server) {
    server.post(`/v1/products`, productsController.createProduct);
    server.get(`/v1/products`, productsController.getProducts);
    server.get(`/v1/products/:productId`, productsController.getProduct);
    server.patch(`/v1/products/:productId`,productsController.patchProduct);
    server.del(`/v1/products/:productId`, productsController.deleteProduct);
}
