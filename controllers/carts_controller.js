'use strict';

/**
 * Creates a new cart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.createCart = function(request, response, next) {
    response.send(200, { OK: 'createCart' });
}

/**
 * Gets all the carts.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getCarts = function(request, response, next) {
    response.send(200, { OK: 'getCarts' });
}

/**
 * Gets a specific cart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getCart = function(request, response, next) {
    response.send(200, { OK: 'getCart' });
}

/**
 * Updates specific information of a cart.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.patchCart = function(request, response, next) {
    response.send(200, { OK: 'patchCart' });
}
