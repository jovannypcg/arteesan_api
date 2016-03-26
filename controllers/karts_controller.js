'use strict';

/**
 * Creates a new kart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.createKart = function(request, response, next) {
    response.send(200, { OK: 'createKart' });
}

/**
 * Gets all the karts.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getKarts = function(request, response, next) {
    response.send(200, { OK: 'getKarts' });
}

/**
 * Gets a specific kart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getKart = function(request, response, next) {
    response.send(200, { OK: 'getKart' });
}

/**
 * Updates specific information of a kart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.patchKart = function(request, response, next) {
    response.send(200, { OK: 'patchKart' });
}
