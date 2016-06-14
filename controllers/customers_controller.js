'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let UserAlreadyRegisteredError = require('./../utils/errors').UserAlreadyRegisteredError;
let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let User = require( './../models/user');

const TAG = 'customers_controller: ';
const LOG_LEVEL = 'debug';

const CREATE_CUSTOMER_EXPECTED_PARAMS = [
    'first_name',
    'last_name',
    'birthdate',
    'email',
    'username',
    'password'
];

const CUSTOMER_RESPONSE_UNDESIRED_KEYS = [
    'password'
];

/**
 * Creates a new customer.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.createCustomer = function(request, response, next) {
    const logger = request.log;

    let userQuery = { username: request.params.username };

    let areValidParams = paramsValidator.validateParams(request.body,
            CREATE_CUSTOMER_EXPECTED_PARAMS);

    if (!areValidParams) {
        responseUtils.errorResponse(response,
                400, responseMessage.MISSED_PARAMS);

        return next();
    }

    let newCustomer = new User({
        first_name: request.params.first_name,
        last_name : request.params.last_name,
        birthdate : request.params.birthdate,
        picture   : request.params.picture || '',
        email     : request.params.email,
        username  : request.params.username,
        password  : request.params.password,
        favorites : request.params.favourites || [],
        purchases : request.params.purchases || []
    });

    User.findOne(userQuery).exec().then(existingUser => {
        if (existingUser) {
            throw new UserAlreadyRegisteredError();
        }

        return newCustomer.save();
    }).then(savedUser => {
        let responseObject = responseUtils.convertToResponseObject(savedUser,
                CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(`${TAG} createCustomer :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

/**
 * Retreives all the customers from the datase.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getCustomers = function(request, response, next) {
    const logger = request.log;

    let query = {
        'role.isCustomer': true
    };

    User.find(query).exec().then(users => {
        let responseObject = responseUtils.convertToResponseObjects(users,
                CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(TAG + error);
        responseUtils.errorResponse(response, 500, error);
        return next();
    });
}

/**
 * Retrieves a single customer using their username sent as parameter in
 * the URL.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getCustomer = function(request, response, next) {
    const logger = request.log;
    let userId = request.params.userId;

    let query = {
        'role.isCustomer': true,
        _id: userId
    };

    User.findOne(query).exec().then(user => {
        let responseObject = responseUtils.convertToResponseObject(user,
                CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(TAG + error);
        responseUtils.errorResponse(response, 500, error);
        return next();
    });
}

exports.patchCustomer = function(request, response, next) {
    response.send(200, {OK: 'PATCH /customers/:username'});
}

/**
 * Removes a customer from the database based on their username.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.removeCustomer = function(request, response, next) {
    const logger = request.log;
    let userId = request.params.userId;

    let query = {
        isCustomer: true,
        isDesigner: false,
        isAdmin   : false,
        _id       : userId
    };

    User.findOne(query).exec().then((user) => {
        if (!user) {
            throw new ObjectNotFoundError();
        }

        return user.remove();
    }).then(removedUser => {
        let responseObject = responseUtils.convertToResponseObject(removedUser,
                CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(`${TAG} removeCustomer :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}
