'use strict';

let kartsController = require('./../controllers/karts_controller');

module.exports = function(server) {
    server.post(`/v1/karts`, kartsController.createKart);
    server.get(`/v1/karts`, kartsController.getKarts);
    server.get(`/v1/karts/:kartId`, kartsController.getKart);
    server.patch(`/v1/karts/:kartId`, kartsController.patchKart);
}
