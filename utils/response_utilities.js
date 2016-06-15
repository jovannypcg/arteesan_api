'use strict';

let config = require('./../config/config');
let objectUtils = require('./object_utilities');
let responseMessage = require('./messages');
let paramsValidator = require('./params_validators');

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
exports.convertToResponseObject = function (doc, undesiredKeys) {
    let responseObject = { data: {} };

    if (!doc) {
        return responseObject;
    }

    doc.__v = undefined;

    for (let undesiredKey of undesiredKeys) {
        doc[undesiredKey] = undefined;
    }

    responseObject.data = objectUtils.clone(doc);

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
    let responseObjects = { meta:{}, data: [], links:{} };

    for (let doc of docs) {
        let responseObject = {};

        doc.__v = undefined;

        for (let undesiredKey of undesiredKeys) {
            doc[undesiredKey] = undefined;
        }

        responseObject = objectUtils.clone(doc);

        if( request ){
            responseObject.links = {};
            responseObject.links.self = `${APPLICATION_URL}${request.path()}/${responseObject._id}`;
        }

        responseObjects.data.push(responseObject);
    }

    responseObjects.meta.total_records = docs.length;
    responseObjects.links.self = `${APPLICATION_URL}${request.href()}`;

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
        case 'UnauthorizedError':
        case 'JsonWebTokenError':
            this.errorResponse(response,
                    401, responseMessage.UNAUTHORIZED);
        case 'ValidationError':
            this.errorResponse(response,
                    409, 'Validation error');
            break;
        default:
            this.errorResponse(response,
                    500, 'DATA BASE ERROR');
    }
};

exports.addPaginationLinks = function(request,pageNumber,pageSize,totalRecords,responseObject){
    let totalPages = totalRecords / pageSize;
    let scope = `${APPLICATION_URL}${request.path()}`;

    responseObject.meta.total_records = totalRecords;
    responseObject.meta.total_pages = Math.ceil( totalPages );

    if( responseObject.meta.total_pages > 1 ){
        let firstUrlValues = objectUtils.clone(request.query);
        let lastUrlValues = objectUtils.clone(request.query);
        let previousUrlValues = objectUtils.clone(request.query);
        let nextUrlValues = objectUtils.clone(request.query);
        let currentUrlValues = objectUtils.clone(request.query);

        firstUrlValues[paramsValidator.PAGE_NUMBER_QUERY_STRING] = (pageNumber === 1)
                ? undefined : 1;

        lastUrlValues[paramsValidator.PAGE_NUMBER_QUERY_STRING] = (pageNumber === responseObject.meta.total_pages)
                ? undefined : responseObject.meta.total_pages;

        previousUrlValues[paramsValidator.PAGE_NUMBER_QUERY_STRING] = (pageNumber > 1)
                ? pageNumber - 1 : undefined;

        nextUrlValues[paramsValidator.PAGE_NUMBER_QUERY_STRING] = (pageNumber < responseObject.meta.total_pages)
                ? pageNumber + 1 : undefined;

        responseObject.links.first = generateLinkUrl(scope, firstUrlValues);
        responseObject.links.last = generateLinkUrl(scope, lastUrlValues)
        responseObject.links.prev = generateLinkUrl(scope, previousUrlValues);
        responseObject.links.next = generateLinkUrl(scope, nextUrlValues);
    }

    return responseObject;
};

/**
 * Generate a string that represents a pagination URL.
 * A pagination URL could be one of the following:
 *
 * next, previous, last, first
 *
 * Samples of 'scope':
 *      /v1/users
 *      /v1/clients
 *
 * Sample of 'queryValues':
 *
 * {
 *     'filter': 'status=ACTIVE,type=OWNER',
 *     'fields': 'first_name,last_name,type,status,created',
 *     'page_size': '2'
 * }
 *
 * This funtion takes 'scope' and 'queryValues' to form a URL like this:
 *
 *  /v1/users?filter=status=ACTIVE,type=OWNER&fileds=created,type&page_size=2
 *
 * @param {string} scope The scope of the URL.
 * @param {object} queryValues Object which contains the query values
                   for the URL.
 */
function generateLinkUrl(scope, queryValues) {
    if (!queryValues[paramsValidator.PAGE_NUMBER_QUERY_STRING]) {
        return undefined;
    }

    let url = scope + '?';

    for (let key in queryValues) {
        url += key + '=' + queryValues[key] + '&';
    }

    url = url.substring(0, url.lastIndexOf('&'));

    return url;
}
