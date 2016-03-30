'use strict';

let cartsController = require('./../controllers/carts_controller');

module.exports = function(server) {
    server.post(`/v1/users/:username/carts`, cartsController.createCart);
    server.get(`/v1/users/:username/carts`, cartsController.getUserCarts);
    server.get(`/v1/users/:username/carts/:cartId`, cartsController.getCart);
    server.patch(`/v1/users/:username/carts/:cartId`, cartsController.patchCart);
}
