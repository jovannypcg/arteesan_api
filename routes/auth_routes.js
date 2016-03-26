'use strict';

let authController = require('./../controllers/auth_controller');

module.exports = function(server) {
    server.post('/v1/login', authController.login);
}
