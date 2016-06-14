'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let UserAlreadyRegisteredError = require('./../utils/errors').UserAlreadyRegisteredError;
let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let User = require( './../models/user');

const TAG = 'designers_controller: ';
const LOG_LEVEL = 'debug';

const CREATE_DESIGNER_EXPECTED_PARAMS = [
    'first_name',
    'last_name',
    'birthdate',
    'email',
    'username',
    'password'
];

const DESIGNER_RESPONSE_UNDESIRED_KEYS = [
    'password'
];

exports.createDesigner = function(request, response, next) {
    const logger = request.log;

    let designerQuery = { username: request.params.username };

    let areValidParams = paramsValidator.validateParams(request.params,
            CREATE_DESIGNER_EXPECTED_PARAMS);

    if (!areValidParams) {
        responseUtils.errorResponse(response,
                400, responseMessage.MISSED_PARAMS);

        return next();
    }

    let newDesigner = new User({
        first_name: request.params.first_name,
        last_name : request.params.last_name,
        birthdate : request.params.birthdate,
        picture   : request.params.picture || '',
        email     : request.params.email,
        username  : request.params.username,
        password  : request.params.password,
        favorites : request.params.favourites || [],
        purchases : request.params.purchases || [],
        products  : request.params.products || [],
        role: {
            isDesigner: true,
        },
    });

    User.findOne(designerQuery).exec().then(existingUser => {
        if (existingUser) {
            throw new UserAlreadyRegisteredError();
        }

        return newDesigner.save();
    }).then(savedUser => {
        let responseObject = responseUtils.convertToResponseObject(savedUser,
                DESIGNER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(LOG_LEVEL, `${TAG} createDesigner :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

exports.getDesigners = function(request, response, next) {
    const logger = request.log;

    let query = {
        'role.isDesigner': true
    };

    User.find(query).exec().then(users => {
        let responseObject = responseUtils.convertToResponseObjects(users,
                DESIGNER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(LOG_LEVEL, TAG + error);
        responseUtils.errorResponse(response, 500, error);
        return next();
    });
}

exports.getDesigner = function(request, response, next) {
    const logger = request.log;
    let userId = request.params.userId;

    let query = {
        'role.isDesigner': true,
        _id: userId
    };

    User.findOne(query).exec().then(user => {
        let responseObject = responseUtils.convertToResponseObject(user,
                DESIGNER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(LOG_LEVEL, TAG + error);
        responseUtils.errorResponse(response, 500, error);
        return next();
    });
}

exports.patchDesigner = function(request, response, next) {
    response.send(200, {OK: 'PATCH /designers/:username'});
}

/**
 * Removes a designer from the database based on their username.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.removeDesigner = function(request, response, next) {
    const logger = request.log;
    let userId = request.params.userId;

    let query = {
        isDesigner: true,
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
                DESIGNER_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(LOG_LEVEL, `${TAG} removeDesigner:: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}
