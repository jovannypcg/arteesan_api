'use strict';

let testsController = require('./../controllers/tests_controller');

module.exports = function(server) {
    server.get('/v1/tests', testsController.getGreet);
}
