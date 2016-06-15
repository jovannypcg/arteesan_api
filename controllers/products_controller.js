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

    let productsQuery = Product.find({});

    if (!objectUtils.isEmpty(request.query)) {
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

        if (!filterObject || !fields || !sortFields) {
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

        if (pagination.hasPagination) {
            productsQuery = productsQuery
                    .sort(sortFields)
                    .skip(pagination.skip)
                    .limit(pagination.pageSize);
        } else if ( limit.hasLimit ) {
            productsQuery = productsQuery
                    .sort(sortFields)
                    .limit(limit.limitNumber);
        } else {
            productsQuery = productsQuery
                    .sort(sortFields);
        }
    }

    // Population is made
    productsQuery = productsQuery.populate('designer',
            DESIGNER_POPULATE_STRING);

    productsQuery.exec().then(products => {
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
    const logger = request.log;

    let query = { _id: request.params.productId };
    let fields = {};

    let productQuery = Product.findOne(query);

    if (!objectUtils.isEmpty(request.query)) {
        let areValidQueryParams = paramsValidator.validateQueryParams(request.query);

        if (!areValidQueryParams) {
            responseUtils.errorResponse(response,
                    400, responseMessage.NOT_VALID_QUERY_PARAMS);

            return next();
        }

        fields = paramsValidator.getFieldsFromQuery(request.query,
                FIELDS_EXPECTED_QUERY_VALUES);

        if (!fields) {
            responseUtils.errorResponse(response,
                    400, responseMessage.NOT_VALID_QUERY_PARAMS);

            return next();
        }

        productQuery = Product.findOne(query, fields);
    }

    // Population is made
    productQuery = productQuery.populate('designer',
            DESIGNER_POPULATE_STRING);

    productQuery.exec().then(product => {
        if (!product) {
            throw new ObjectNotFoundError();
        }

        let responseObject = responseUtils.convertToResponseObject(
                product,
                PRODUCT_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} getProduct :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
    const logger = request.log;

    let query = { _id: request.params.productId };

    if (objectUtils.isEmpty(request.body)) {
        responseUtils.errorResponse(response,
                400, responseMessage.NOT_VALID_PARAMS);

        return next();
    }

    Product.findOne(query).exec().then(product => {
        if (!product) {
            throw new ObjectNotFoundError();
        }

        product.name = request.body.name || product.name;
        product.price = request.body.price || product.price;
        product.description = request.body.description || product.description;
        product.thumbnail = request.body.thumbnail || product.thumbnail;
        product.designer = request.body.designer || product.designer;

        return product.save();
    }).then(patchedProduct => {
        let responseObject = responseUtils.convertToResponseObject(
                patchedProduct,
                PRODUCT_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} patchProduct :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
    const logger = request.log;

    let query = { _id: request.params.productId };

    Product.findOne(query).exec().then(product => {
        if (!product) {
            throw new ObjectNotFoundError();
        }

        return product.remove();
    }).then(deletedProduct => {
        let responseObject = responseUtils.convertToResponseObject(
                deletedProduct,
                PRODUCT_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} deleteProduct :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}
