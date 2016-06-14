'use strict';

let authController = require('./../controllers/auth_controller');
let customersController = require('./../controllers/customers_controller.js');

module.exports = function(server) {
    server.post(`/v1/customers`, customersController.createCustomer);
    server.get(`/v1/customers`, customersController.getCustomers);
    server.get(`/v1/customers/:userId`, customersController.getCustomer);
    server.patch(`/v1/customers/:userId`,customersController.patchCustomer);
    server.del(`/v1/customers/:userId`, customersController.removeCustomer);
}
