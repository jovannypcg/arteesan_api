'use strict';

let config = require('./../config/config');
let objectUtils = require('./object_utilities');
let responseMessage = require('./messages');

const APPLICATION_URL = config.app.url;

/**
 * Response an error message to the request.
 *
 * @param {object} The HTTP Response object.
 * @param {number} status HTTP status (200, 400, 404, etc).
 * @param {string} code Code from the api to the client.
 *                      This code is from response_messages.js.
 * @param {string} detail Detail message of the error.
 *                        This message is from response_messages.js.
 */
exports.errorResponse = function (response, status, detail) {
    response.send(status, {
        error: {
            status: status,
            detail: detail
        }
    });
};

/**
* Return Response Object
*
* @param {object} doc Document to return en inreponse.
* @param {array} undesiredKeys Set of keys (in string) you do not want to appear in your docs.
* @param {object} request Object with the info of de request.
*/
exports.convertToResponseObject = function (doc, undesiredKeys, request) {
    let responseObject = { data: {} };

    if (!doc) {
        return responseObject;
    }

    doc.__v = undefined;

    for (let undesiredKey of undesiredKeys) {
        doc[undesiredKey] = undefined;
    }

    responseObject.data = objectUtils.clone(doc);

    if( request ){
        responseObject.data.link = `${APPLICATION_URL}${request.href()}`;
    }

    return responseObject;
};

/**
* Returns a well-formatted response array.
*
* @param {object} docs Documents format.
* @param {array} undesiredKeys Set of keys (in string) you do not want to appear in your docs.
* @param {object} request Object with the info of de request.
*/
exports.convertToResponseObjects = function(docs, undesiredKeys, request) {
    let responseObjects = { meta:{}, data: [] };

    for (let doc of docs) {
        let responseObject = {};

        doc.__v = undefined;

        for (let undesiredKey of undesiredKeys) {
            doc[undesiredKey] = undefined;
        }

        responseObject = objectUtils.clone(doc);

        if( request ){
            responseObject.link = `${APPLICATION_URL}${request.path()}/${responseObject.username}`;
        }

        responseObjects.data.push(responseObject);
    }

    responseObjects.meta.total_records = docs.length;

    return responseObjects;
};

exports.errorResponseBaseOnErrorType = function (error, response){
    switch (error.name) {
        case 'NotValidParametersInRequestError':
            this.errorResponse(response,
                    400, 'Not valid parameters');
            break;
        case 'NoParamsFoundError':
            responseUtls.errorResponse(response,
                    400, 'No params');
            break;
        case 'CastError':
            this.errorResponse(response,
                    404, 'cast error');
            break;
        case 'ObjectNotFoundError':
            this.errorResponse(response,
                    404, responseMessage.OBJECT_NOT_FOUND);
            break;
        case 'UserAlreadyRegisteredError':
            this.errorResponse(response,
                    409, responseMessage.USER_ALREADY_REGISTERED);
            break;
        case 'ValidationError':
            this.errorResponse(response,
                    409, 'Validation error');
            break;
        default:
            this.errorResponse(response,
                    500, 'DATA BASE ERROR');
    }
};
