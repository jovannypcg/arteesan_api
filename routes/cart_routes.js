'use strict';

let cartsController = require('./../controllers/carts_controller');

module.exports = function(server) {
    server.post(`/v1/users/:userId/carts`, cartsController.createCart);
    server.get(`/v1/users/:userId/carts`, cartsController.getUserCarts);
    server.get(`/v1/users/:userId/carts/:cartId`, cartsController.getCart);
    server.patch(`/v1/users/:userId/carts/:cartId`, cartsController.patchCart);
}
