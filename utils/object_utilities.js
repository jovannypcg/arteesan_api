'use strict';

let hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Provides utility functions to handle objects.
 */
module.exports = {
    /**
     * Verifies if an object is empty (has no properties) or not.
     *
     * @param {object} obj The object to analyze.
     * @return {boolean} true if the object is empty, false otherwise.
     */
    isEmpty: function isEmpty(obj) {
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    },

    /**
     * Gets the size of an object.
     * Counts the number of keys the object has at the top level
     * of it.
     *
     * obj = { name: 'Jovanny', phone: '5512345678', company: 'KPulse' }
     *
     * size(obj)  ====> 3
     *
     * @param {object} obj The object to get its size.
     * @return The size (number of keys at the top level) of the object.
     */
    sizeOf: function(obj) {
        let size = 0;

        for (let key in obj) {
            size++;
        }

        return size;
    },

    /**
     * Verifies if 'match' is in 'array'.
     *
     * @param {object} match The object we want to know if exists in 'array'.
     * @param {array} array The array.
     */
    inArray: function(match, array) {
        let result = false;

        for (let item of array) {
            if (match == item) {
                result = true;
                break;
            }
        }

        return result;
    },

    /**
     * Verifies if 'inString' contains 'match'.
     *
     * Sample:
     *      inString = 'abcd'
     *      match = 'b'
     *      contains(match, inString) ===> true
     *
     *      inString = 'abcd'
     *      match = 'z'
     *      contains(match, inString) ===> false
     *
     * @param {string} match The string we want to know whether is inside
     *                       another string.
     * @param {string} inString The string we expect 'match' to be inside.
     * @return true if 'inString' contains 'match', false otherwise.
     */
    contains: function(inString, match) {
        return inString.indexOf(match) != -1 ? true : false;
    },

    /**
     * Clones the object sent as parameter.
     * Since the assignment operator (=) assings a references of an object,
     * this function makes a clone, this way, the resulting object will not
     * have troubles regarding references.
     *
     * @param {object} obj The object to clone.
     * @return {object} The cloned object.
     */
    clone: function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Removes completely 'match' from 'array'.
     *
     * @param {object} match The object to remove from the array.
     * @param {array} array The array.
     * @return {array} An array with 'match' removed.
     */
    removeAllFromArray: function(match, array) {
        let arrayClone = this.clone(array);

        while(this.inArray(match, arrayClone)) {
            let index = arrayClone.indexOf(match);

            arrayClone.splice(index, 1);
        }

        return arrayClone;
    },

    /**
     * Retrieves the given 'attributes' from the 'object'.
     *
     * @param {object} obj The object to retrieve the attributes from.
     * @param {array} attrs List of strings which represent the attributes to
     *                      retreive from 'obj'.
     */
    getAttributesFromObject(obj, attrs) {
        let resultObject = {};

        for (let attr of attrs) {
            if (attr in obj) {
                resultObject[attr] = obj[attr];
            }
        }

        return resultObject;
    }
};
