'use strict';

import User from './../models/user';
import responseMessage from './../utils/messages';
import securityUtils from './../utils/security_utilities';
import responseUtils from './../utils/response_utilities';
import paramsValidator from './../utils/params_validators';

const TAG = 'auth_controller';
const LOG_LEVEL = 'debug';

const LOGIN_EXPECTED_PARAMS = [
    'username',
    'password'
]

exports.login = function(request, response, next) {
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
                    400, responseMessage.PROVIDED_INFO_DOES_NOT_MATCH);

            return next();
        }

        payload = {
            username: foundUser.username,
            id: foundUser.id
        };

        credential = securityUtils.getCredential(
                foundUser.email,
                foundUser.username,
                foundUser.birthDate);

        token = securityUtils.getToken(payload, credential);

        response.send(200, {
            data: {
                token: token,
                credential: credential
            }
        });

        return next();
    }).catch(error => {
        logger.log(LOG_LEVEL, TAG + error);
        responseUtils.errorResponse(response, 500, error);
        return next();
    });
}

exports.authenticate = function(request, response, next) {
    let token = request.headers.authorization;
    let decodedToken = securityUtils.decodeToken(token);
    let verifiedToken;
    let userQuery;

    if (!token || !decodedToken) {
        responseUtils.errorResponse(response,
                401, responseMessage.UNAUTHORIZED);

        return;
    }

    userQuery = {
        username: decodedToken.username
    };

    User.findOne(userQuery).exec().then(user => {
        if (!user) {
            responseUtils.errorResponse(response,
                    401, responseMessage.UNAUTHORIZED);

            return;
        }

        let credential = securityUtils.getCredential(user.email,
                user.username, user.birthDate);

        verifiedToken = securityUtils.verifyToken(token, credential);

        if (!verifiedToken) {
            responseUtils.errorResponse(response,
                    401, responseMessage.UNAUTHORIZED);

            return;
        }

        return next();
    }).catch(error => {
        logger.log(LOG_LEVEL, TAG + error);

        if (error.name == 'JsonWebTokenError') {
            responseUtils.errorResponse(response,
                    401, responseMessage.UNAUTHORIZED);
        } else {
            responseUtils.errorResponse(response, 500, error);
        }

        return next();
    });

    return next();
}
