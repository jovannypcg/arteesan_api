'use strict';

let designersController = require('./../controllers/designers_controller');

module.exports = function(server) {
    server.post(`/v1/designers`, designersController.createDesigner);
    server.get('/v1/designers', designersController.getDesigners);
    server.get('/v1/designers/:username', designersController.getDesigner);
    server.patch('/v1/designers/:username', designersController.patchDesigner);
    server.del(`/v1/designers/:username`, designersController.removeDesigner);
}
