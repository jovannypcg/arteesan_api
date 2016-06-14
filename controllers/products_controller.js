'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let Product = require('./../models/product');

const TAG = 'products_controller';

/**
 * Specifies the mandatory fields that the POST /products request must have.
 */
const PRODUCT_EXPECTED_PARAMS = [
    'name',
    'price',
    'description',
    'thumbnail',
    'designer'
];

/**
 * The values we expect the 'fields' query parameter to have.
 */
const FIELDS_EXPECTED_QUERY_VALUES = [
    'created_at',
    'name',
    'price',
    'description',
    'status',
    'available',
    'tags',
    'favorites',
    'purchases',
    'shares',
    'designer',
    'galery'
];

/**
 * The "fields" inside this array are going to be ignored
 * when a product is a response.
 */
const PRODUCT_RESPONSE_UNDESIRED_KEYS = [];

/**
 * Inserts a product into the database.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.createProduct = function(request, response, next) {
    const logger = request.log;

    let areValidParams = paramsValidator.validateParams(request.body,
            PRODUCT_EXPECTED_PARAMS);

    if (!areValidParams) {
        responseUtils.errorResponse(response,
                400, responseMessage.MISSED_PARAMS);

        return next();
    }

    let newProduct = new Product({
        name: request.body.name,
        price: request.body.price,
        description: request.body.description,
        thumbnail: request.body.thumbnail,
        designer: request.body.designer
    });

    newProduct.save().then(savedProduct => {
        let responseObject = responseUtils.convertToResponseObject(
                savedProduct,
                PRODUCT_RESPONSE_UNDESIRED_KEYS,
                request);

        response.send(201,responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} createProduct :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

/**
 * Gets the products from the database.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getProducts = function(request, response, next) {

}

/**
 * Gets a specific product from the database.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getProduct = function(request, response, next) {

}

/**
 * Updates partial information of a specific product in the database.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.patchProduct = function(request, response, next) {

}

/**
 * Deletes a specific product from the database.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.deleteProduct = function(request, response, next) {

}
