'use strict';

let securityUtils = require('./../utils/security_utilities');

exports.getGreet = function(request, response, next) {
    response.send(200, securityUtils.getCredential());
    return next();
}
