'use strict';

let objectUtilities = require('./object_utilities');

const FILTER = 'filter';
const SORT = 'sort';
const PAGE_NUMBER = 'page';
const PAGE_SIZE = 'limit';
const FIELD = 'fields';

const EXPECTED_QUERY_PARAMS = [
    FILTER,
    SORT,
    PAGE_NUMBER,
    PAGE_SIZE,
    FIELD
];

const DEFAULT_PAGE_SIZE = 20;

/**
 * Provides methods to validate the parameters in requests.
 */
module.exports = {
    FILTER_QUERY_STRING: FILTER,
    SORT_QUERY_STRING: SORT,
    PAGE_NUMBER_QUERY_STRING: PAGE_NUMBER,
    PAGE_SIZE_QUERY_STRING: PAGE_SIZE,
    FIELD_QUERY_STRING: FIELD,

    /**
     * Validates if the keys of a JSON object are expected.
     * First, it validates the sizes of 'params' and expectedParams; if
     * the size of 'params' is less than the size of expectedParams,
     * false is returned.
     *
     * params = { name: 'Jovanny', phone: '5512345678' }
     * expectedParams = ['name', 'phone']
     *
     * @param {object} params JSON object to be analyzed.
     * @param {array} expectedParams Set of 'keys' that are expected
     *                               to be in the JSON object 'params'.
     */
    validateParams: function(params, expectedParams) {
        if (objectUtilities.sizeOf(params) <
            objectUtilities.sizeOf(expectedParams)) {
            return false;
        }

        for (let expectedParam of expectedParams) {
            if (!(expectedParam in params)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Validates if the params.query of a request has the expected parameters
     * sent as parameter in this function.
     *
     * request.query is a JSON object which contains keys.
     * These keys are compared with the ones in expectedParams.
     *
     * @param {object} params JSON object which represents request.query.
     */
    validateQueryParams: function(params) {
        for (let param in params) {
            if (!objectUtilities.inArray(param, EXPECTED_QUERY_PARAMS)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Checks if the 'queryValues' are valid based on the 'expectedValues'.
     *
     * @param {array} queryValues Values to check.
     * @param {array} expectedValues The expected values 'queryValues' to have.
     */
    validateQueryParamValues: function(queryValues, expectedValues) {
        for (let value of queryValues) {
            if (!objectUtilities.inArray(value, expectedValues)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Gets the 'fields' values from the query parameters.
     *
     * @param {object} The request query.
     * @param {array} validFields Valid fields that 'requestQuery' must have.
     * @return {object} The fields in the request query.
     */
    getFieldsFromQuery: function(requestQuery, validFields) {
        let fields = {};

        if (this.FIELD_QUERY_STRING in requestQuery) {
            let fieldsInQuery =requestQuery[this.FIELD_QUERY_STRING].split(',');

            let areValidQueryValues =
                    this.validateQueryParamValues(fieldsInQuery, validFields);

            if (!areValidQueryValues) {
                return undefined;
            }

            for (let fieldInQuery of fieldsInQuery) {
                fields[fieldInQuery] = 1;
            }
        }

        return fields;
    },

    /**
     * Gets the filters values from the request query.
     *
     * @param {object} requestQuery The request query.
     * @param {array} validFilters The valid filter values 'requestQuery'
     *                             must have.
     * @return {object} The filter values in the request query.
     */
    getFiltersFromQuery: function (requestQuery, validFilters) {
        let filterObject = {};

        if (this.FILTER_QUERY_STRING in requestQuery) {
            let filtersKeysInQuery = [];
            let filtersInQuery = [];

            if (typeof requestQuery[this.FILTER_QUERY_STRING] === 'string') {
                filtersInQuery =
                        requestQuery[this.FILTER_QUERY_STRING].split(',');
            } else if (typeof requestQuery === 'object') {
                for (let fieldInQuery of
                     requestQuery[this.FILTER_QUERY_STRING]) {
                    filtersInQuery.push(fieldInQuery);
                }
            }else{
                return undefined;
            }

            for (let filterInQuery of filtersInQuery) {
                let filterIdentifier = filterInQuery.substring(0,
                        filterInQuery.indexOf('='));
                let filterKey = filterInQuery.substring(0,
                        filterInQuery.indexOf('='));
                let filterValue = filterInQuery.substring(
                        filterInQuery.indexOf('=') + 1,
                        filterInQuery.length);

                filtersKeysInQuery.push(filterKey);
                filterObject[filterIdentifier] = filterValue;
            }

            let areValidFilterValues =
                    this.validateQueryParamValues(filtersKeysInQuery,
                            validFilters);

            if (!areValidFilterValues) {
                return undefined;
            }
        }

        return filterObject;
    },

    /**
     * Gets the sort values from the request query.
     *
     * @param {object} requestQuery The request query.
     * @param {array} validFilters The valid sort values 'requestQuery'
     *                             must have.
     * @return {object} The sort fields in the request query.
     */
    getSortFieldsFromQuery: function (requestQuery, validFields) {
        let sortFields = {};

        if (this.SORT_QUERY_STRING in requestQuery) {
            let sortFieldsInQuery =
                    requestQuery[this.SORT_QUERY_STRING].split(',');
            let sortFiledsToValidate = [];

            for (let sortFieldInQuery of sortFieldsInQuery) {
                if (objectUtilities.contains(sortFieldInQuery, '-')) {
                    let sortFieldIdentifier = sortFieldInQuery.substring(
                            sortFieldInQuery.indexOf('-') + 1,
                            sortFieldInQuery.length);

                    sortFields[sortFieldIdentifier] = -1;
                    sortFiledsToValidate.push(sortFieldIdentifier);
                } else {
                    sortFields[sortFieldInQuery] = 1;
                    sortFiledsToValidate.push(sortFieldInQuery);
                }
            }

            let areValidSortQueryValues =
                    this.validateQueryParamValues(sortFiledsToValidate,
                            validFields);

            if (!areValidSortQueryValues) {
                return undefined;
            }
        }

        return sortFields;
    },

    /**
     * Gets the limit value from the 'limit' query in the request.
     *
     * @param {object} requestQuery The request query.
     * @return {object} Object which have a boolean to know if the query
     *                  has ot not limit and the limit number.
     */
    getLimitFromQuery: function (requestQuery) {
        let limit = requestQuery[this.PAGE_SIZE_QUERY_STRING];
        let limiter = {};

        if ( limit ) {
            limiter.hasLimit = true;
            limiter.limitNumber = Number(limit);
        }else{
            limiter.hasLimit = false;
            limiter.limitNumber = 0;
        }

        return limiter;
    },

    /**
     * Gets the page number from the 'page' query in the request.
     *
     * @param {object} requestQuery The request query.
     * @param {number} limitNumber The number of items per page.
     * @return {object} Object which have a boolean to know if the query
     *                  has ot not pagination, the number of page and the
     *                  values used by mongo to search a range of documents.
     */
    getPaginationFromQuery: function (requestQuery, limitNumber){
        let page = requestQuery[this.PAGE_NUMBER_QUERY_STRING];
        let pagination = {};

        if ( page ) {
            pagination.hasPagination = true;
            pagination.page = Number(page);
            pagination.pageSize = (limitNumber === 0)
                    ? DEFAULT_PAGE_SIZE
                    : limitNumber;
            pagination.skip =
                ( Number(page) * pagination.pageSize ) - pagination.pageSize;
        } else {
            pagination.hasPagination = false;
        }

        return pagination;
    }
}
