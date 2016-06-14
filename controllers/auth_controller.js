'use strict';

let User = require('./../models/user');
let responseMessage = require('./../utils/messages');
let securityUtils = require('./../utils/security_utilities');
let responseUtils = require('./../utils/response_utilities');
let paramsValidator = require('./../utils/params_validators');
let UnauthorizedError = require('./../utils/errors').UnauthorizedError;

const TAG = 'auth_controller';
const LOG_LEVEL = 'debug';

const LOGIN_EXPECTED_PARAMS = [
    'username',
    'password'
]

exports.login = function(request, response, next) {
    const logger = request.log;

    let payload;
    let token;
    let credential;

    let username = request.params.username;
    let password = request.params.password;

    let query = {
        username: username
    };

    let areValidParams = paramsValidator.validateParams(request.params,
            LOGIN_EXPECTED_PARAMS);

    if (!areValidParams) {
        responseUtils.errorResponse(response,
                400, responseMessage.MISSED_PARAMS);

        return next();
    }

    User.findOne(query).exec().then(foundUser => {
        if (!foundUser || foundUser.password != password) {
            responseUtils.errorResponse(response,
                    401, responseMessage.PROVIDED_INFO_DOES_NOT_MATCH);

            return next();
        }

        payload = {
            username: foundUser.username,
            id: foundUser.id
        };

        credential = securityUtils.getCredential();
        token = securityUtils.getToken(payload, credential);

        response.send(200, {
            data: {
                token: token
            }
        });

        return next();
    }).catch(error => {
        logger.error( `${TAG} login :: ${error}` );
        responseUtls.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

exports.authenticate = function(request, response, next) {
    const logger = request.log;

    let token = request.headers.authorization;
    let credential = securityUtils.getCredential();
    let verifiedToken;
    let userQuery;

    if (!token) {
        responseUtils.errorResponse(response,
                401, responseMessage.UNAUTHORIZED);

        return;
    }

    try {
        verifiedToken = securityUtils.verifyToken(token, credential);

        if (!verifiedToken) {
            throw new UnauthorizedError();
        }

        return next();
    } catch (error) {
        logger.error( `${TAG} authenticate :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    }
}
