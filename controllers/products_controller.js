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
    'thumbnail',
    'pics'
];

/**
 * The values that the 'sort' query parameter is expected to have.
 */
const SORT_EXPECTED_QUERY_VALUES = [
    'created_at',
    'name',
    'price',
    'status'
];

/**
 * The values that the 'filter' query parameter is expected to have.
 */
const FILTER_EXPECTED_QUERY_VALUES = [
    'created_at',
    'price',
    'status',
    'available',
    'designer'
];

/**
 * The "fields" inside this array are going to be ignored
 * when a product is a response.
 */
const PRODUCT_RESPONSE_UNDESIRED_KEYS = [];

/**
 * The values that the 'includes' query parameter is expected to have.
 */
const INCLUDES_EXPECTED_QUERY_VALUES = ['designer'];

/**
 * Used to populate 'designers' when getProducts is executed.
 */
const DESIGNER_POPULATE_STRING
        = '_id first_name birthdate picture email username status followers';
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
    const logger = request.log;

    let query = {};
    let fields = {};
    let filterObject = {};
    let sortFields = {};
    let pagination = {};
    let limit = {};
    let includes = [];

    let productsQuery;

    if (objectUtils.isEmpty(request.query)) {
        productsQuery = Product.find({}).exec();
    } else {
        let areValidQueryParams = paramsValidator.validateQueryParams(
                request.query);

        if (!areValidQueryParams) {
            responseUtils.errorResponse(response,
                    400, responseMessage.NOT_VALID_QUERY_PARAMS);

            return next();
        }

        fields = paramsValidator.getFieldsFromQuery(request.query,
                FIELDS_EXPECTED_QUERY_VALUES);
        filterObject = paramsValidator.getFiltersFromQuery(request.query,
                FILTER_EXPECTED_QUERY_VALUES);
        sortFields = paramsValidator.getSortFieldsFromQuery(request.query,
                SORT_EXPECTED_QUERY_VALUES);
        includes = paramsValidator.getIncludesFromQuery(request.query,
                INCLUDES_EXPECTED_QUERY_VALUES);

        if (!filterObject || !fields || !sortFields || !includes) {
            responseUtils.errorResponse(response,
                    400, responseMessage.NOT_VALID_QUERY_PARAMS);

            return next();
        }

        for (let filter in filterObject) {
            query[filter] = filterObject[filter];
        }

        limit = paramsValidator.getLimitFromQuery(request.query);

        pagination = paramsValidator.getPaginationFromQuery(request.query,
                limit.limitNumber);

        // Create Query
        productsQuery = Product.find(query, fields);

        // Adding populates
        if(includes.length > 0){
            if( objectUtils.inArray('designer', includes) ){
                productsQuery = productsQuery.populate('designer',
                        DESIGNER_POPULATE_STRING);
            }
        }

        if (pagination.hasPagination) {
            productsQuery = productsQuery
                    .sort(sortFields)
                    .skip(pagination.skip)
                    .limit(pagination.pageSize)
                    .exec();
        } else if ( limit.hasLimit ) {
            productsQuery = productsQuery
                    .sort(sortFields)
                    .limit(limit.limitNumber)
                    .exec();
        } else {
            productsQuery = productsQuery
                    .sort(sortFields)
                    .exec();
        }
    }

    productsQuery.then(products => {
        if (pagination.hasPagination) {
            Product.find(query, fields)
                    .sort(sortFields)
                    .count()
                    .exec()
                    .then((totalProducts) => {
                let responseObject = responseUtils.convertToResponseObjects(
                        products,
                        PRODUCT_RESPONSE_UNDESIRED_KEYS,
                        request);

                responseObject = responseUtils.addPaginationLinks(request,
                        pagination.page,
                        pagination.pageSize,
                        totalProducts,
                        responseObject);

                response.send(200, responseObject);
                return next();
            }).catch((error) => {
                logger.error(`${TAG} getProducts :: ${error}`);
                responseUtils.errorResponseBaseOnErrorType(error, response);

                return next();
            });
        } else {
            let responseObject = responseUtils.convertToResponseObjects(
                    products,
                    PRODUCT_RESPONSE_UNDESIRED_KEYS,
                    request);

            response.send(200, responseObject);
            return next();
        }
    }).catch(error => {
        logger.error( `${TAG} getProducts :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
