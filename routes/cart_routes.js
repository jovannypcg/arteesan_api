'use strict';

let cartsController = require('./../controllers/carts_controller');

module.exports = function(server) {
    server.post(`/v1/carts`, cartsController.createCart);
    server.get(`/v1/carts`, cartsController.getCarts);
    server.get(`/v1/carts/:cartId`, cartsController.getCart);
    server.patch(`/v1/carts/:cartId`, cartsController.patchCart);
}
