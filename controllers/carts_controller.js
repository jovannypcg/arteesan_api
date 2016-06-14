'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let Cart = require( './../models/cart');
let User = require( './../models/user');

const TAG = 'carts_controller';

const CART_RESPONSE_UNDESIRED_KEYS = [];

const CART_EXPECTED_PARAMS = [
    'products'
];

/**
 * Used to populate 'user' responding a cart request.
 */
const USER_POPULATE_STRING = 'first_name last_name username email birthdate';

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
    const logger = request.log;

    let userId = request.params.userId;

    const userQuery = {
        _id: userId,
        'role.isCustomer': true
    };

    let areValidParams = paramsValidator.validateParams(request.body,
            CART_EXPECTED_PARAMS);

    if (!areValidParams) {
        responseUtils.errorResponse(response,
                400, responseMessage.MISSED_PARAMS);

        return next();
    }

    User.findOne(userQuery).exec().then(foundUser => {
        if (!foundUser) {
            throw new ObjectNotFoundError();
        }

        let userId = foundUser._id;

        let newCart = new Cart({
            owner: userId,
            products: request.body.products
        });

        return newCart.save();
    }).then(savedCart => {
        let responseObject = responseUtils.convertToResponseObject(savedCart,
                CART_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(`${TAG} createCart :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
exports.getUserCarts = function(request, response, next) {
    const logger = request.log;

    let userId = request.params.userId;

    let cartQuery = {};
    let userQuery = {
        _id: userId,
        'role.isCustomer': true
    }

    User.findOne(userQuery).exec().then(foundUser => {
        if (!foundUser) {
            throw new ObjectNotFoundError();
        }

        let userId = foundUser._id;

        cartQuery.owner = userId;

        return Cart.find(cartQuery).populate('owner',
                USER_POPULATE_STRING).exec();
    }).then(foundCarts => {
        let responseObject = responseUtils.convertToResponseObjects(foundCarts,
                CART_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(`${TAG} getCarts :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
