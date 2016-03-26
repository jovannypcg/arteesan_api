'use strict';

let objectUtilities = require('./object_utilities');

/**
 * Provides methods to validate the parameters in requests.
 */
module.exports = {
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
}
