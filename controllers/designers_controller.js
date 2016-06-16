'use strict';

let objectUtils = require('./../utils/object_utilities');
let securityUtils = require('./../utils/security_utilities');
let paramsValidator = require('./../utils/params_validators');
let responseUtils = require('./../utils/response_utilities');
let responseMessage = require('./../utils/messages');

let UserAlreadyRegisteredError = require('./../utils/errors').UserAlreadyRegisteredError;
let ObjectNotFoundError = require('./../utils/errors').ObjectNotFoundError;

let User = require( './../models/user');

const TAG = 'designers_controller';

/**
 * Specifies the mandatory fields that the POST /designers request must have.
 */
const DESIGNER_EXPECTED_PARAMS = [
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
    'followers',
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

const DESIGNER_RESPONSE_UNDESIRED_KEYS = [
    'password'
];

/**
 * Creates a new designer.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.createDesigner = function(request, response, next) {
    const logger = request.log;

    let userQuery = { username: request.params.username };

    let areValidParams = paramsValidator.validateParams(request.body,
            DESIGNER_EXPECTED_PARAMS);

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
        favorites : request.params.favorites || [],
        followers : request.params.followers || [],
        role: {
            isAdmin: false,
            isDesigner: true,
            isCustomer: true
        }
    });

    User.findOne(userQuery).exec().then(existingUser => {
        if (existingUser) {
            throw new UserAlreadyRegisteredError();
        }

        return newDesigner.save();
    }).then(savedUser => {
        let responseObject = responseUtils.convertToResponseObject(
                savedUser,
                DESIGNER_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error(`${TAG} createDesigner :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

/**
 * Retreives all the designers from the datase.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getDesigners = function(request, response, next) {
    const logger = request.log;

    let query = {
        'role.isDesigner': true
    };

    let fields = {};
    let filterObject = {};
    let sortFields = {};
    let pagination = {};
    let limit = {};

    let usersQuery = User.find(query);

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
                        DESIGNER_RESPONSE_UNDESIRED_KEYS,
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
                    DESIGNER_RESPONSE_UNDESIRED_KEYS,
                    request);

            response.send(200, responseObject);
            return next();
        }
    }).catch(error => {
        logger.error( `${TAG} getDesigners :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

/**
 * Retrieves a single designer using their username sent as parameter in
 * the URL.
 *
 * @param {object} request  The HTTP request object, which could
 *                          have query parameters.
 * @param {object} response The HTTP response object which will
 *                          reply to the request.
 * @param {funciton} next   Callback function to execute after responding
 *                          to the request.
 */
exports.getDesigner = function(request, response, next) {
    const logger = request.log;
    let userId = request.params.userId;

    let query = {
        'role.isDesigner': true,
        _id: userId
    };

    let fields = {};

    let userQuery = User.findOne(query);

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

        userQuery = User.findOne(query, fields);
    }

    userQuery.exec().then(user => {
        if (!user) {
            throw new ObjectNotFoundError();
        }

        let responseObject = responseUtils.convertToResponseObject(
                user,
                DESIGNER_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} getDesigner :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}

exports.patchDesigner = function(request, response, next) {
    const logger = request.log;

    let query = {
        _id: request.params.userId,
        'role.isDesigner': true
    };

    if (objectUtils.isEmpty(request.body)) {
        responseUtils.errorResponse(response,
                400, responseMessage.NOT_VALID_PARAMS);

        return next();
    }

    User.findOne(query).exec().then(user => {
        if (!user) {
            throw new ObjectNotFoundError();
        }

        user.first_name = request.body.first_name || user.first_name;
        user.last_name = request.body.last_name || user.last_name;
        user.birthdate = request.body.birthdate || user.birthdate;
        user.picture = request.body.picture || user.picture;
        user.email = request.body.email || user.email;
        user.password = request.body.password || user.password;
        user.status = request.body.status || user.status;
        user.role = request.body.role || user.role;

        return user.save();
    }).then(patchedUser => {
        let responseObject = responseUtils.convertToResponseObject(
                patchedUser,
                DESIGNER_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} patchDesigner:: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
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
        _id: userId,
        'role.isCustomer': true,
        'role.isAdmin': false,
        'role.isDesigner': true
    };

    console.log(query);

    User.findOne(query).exec().then(user => {
        if (!user) {
            throw new ObjectNotFoundError();
        }

        return user.remove();
    }).then(deletedUser => {
        let responseObject = responseUtils.convertToResponseObject(
                deletedUser,
                DESIGNER_RESPONSE_UNDESIRED_KEYS);

        response.send(200, responseObject);
        return next();
    }).catch(error => {
        logger.error( `${TAG} deleteDesigner :: ${error}` );
        responseUtils.errorResponseBaseOnErrorType(error, response);
        return next();
    });
}
