'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let UserAlreadyRegisteredError = require('./../utils/errors').UserAlreadyRegisteredError;
let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let User = require( './../models/user');

const TAG = 'customers_controller';

/**
 * Specifies the mandatory fields that the POST /customers request must have.
 */
const CUSTOMER_EXPECTED_PARAMS = [
    'first_name',
    'last_name',
    'birthdate',
    'email',
    'username',
    'password'
];

/**
 * The values we expect the 'fields' query parameter to have.
 */
const FIELDS_EXPECTED_QUERY_VALUES = [
    'created_at',
    'first_name',
    'last_name',
    'birthdate',
    'picture',
    'email',
    'username',
    'status',
    'favorites',
    'role'
];

/**
 * The values that the 'sort' query parameter is expected to have.
 */
const SORT_EXPECTED_QUERY_VALUES = [
    'created_at',
    'first_name',
    'last_name',
    'birthdate',
    'email',
    'username',
    'status'
];

/**
 * The values that the 'filter' query parameter is expected to have.
 */
const FILTER_EXPECTED_QUERY_VALUES = [
    'created_at',
    'first_name',
    'last_name',
    'birthdate',
    'picture',
    'email',
    'username',
    'status'
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
            CUSTOMER_EXPECTED_PARAMS);

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

    let fields = {};
    let filterObject = {};
    let sortFields = {};
    let pagination = {};
    let limit = {};

    let usersQuery = User.find({});

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
        usersQuery = User.find(query, fields);

        if (pagination.hasPagination) {
            usersQuery = usersQuery
                    .sort(sortFields)
                    .skip(pagination.skip)
                    .limit(pagination.pageSize);
        } else if ( limit.hasLimit ) {
            usersQuery = usersQuery
                    .sort(sortFields)
                    .limit(limit.limitNumber);
        } else {
            usersQuery = usersQuery
                    .sort(sortFields);
        }
    }

    usersQuery.exec().then(users => {
        if (pagination.hasPagination) {
            User.find(query, fields)
                    .sort(sortFields)
                    .count()
                    .exec()
                    .then((totalUsers) => {
                let responseObject = responseUtils.convertToResponseObjects(
                        users,
                        CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                        request);

                responseObject = responseUtils.addPaginationLinks(request,
                        pagination.page,
                        pagination.pageSize,
                        totalUsers,
                        responseObject);

                response.send(200, responseObject);
                return next();
            }).catch((error) => {
                logger.error(`${TAG} getUsers :: ${error}`);
                responseUtils.errorResponseBaseOnErrorType(error, response);

                return next();
            });
        } else {
            let responseObject = responseUtils.convertToResponseObjects(
                    users,
                    CUSTOMER_RESPONSE_UNDESIRED_KEYS,
                    request);

            response.send(200, responseObject);
            return next();
        }
    }).catch(error => {
        logger.error( `${TAG} getUsers :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
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
