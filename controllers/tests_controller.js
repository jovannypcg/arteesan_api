'use strict';

exports.getGreet = function(request, response, next) {
    response.send(200, 'Hi there!!');
    return next();
}
