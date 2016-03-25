'use strict';

let jwt = require('jsonwebtoken');
let hash = require('sha1');
const config = require('./../config/config');

/**
 * Generates a credential for singing in.
 */
exports.getCredential = function() {
    return hash(config.auth_secret);
}

/**
 * Generates a JSON Web Token based on the payload and the secret key.
 * The key is the user's credential and the payload is the following object:
 *
 * {
 *      username: String,
 *      id: String
 * }
 *
 * @param {object} payload The attributes of the payload for the JWT.
 * @param {string} key The secret key used by JWT to generate the token.
 */
exports.getToken = function(payload, key) {
    return jwt.sign(payload, key);
}

/**
 * Decodes a given token.
 *
 * @param {string} token The token to decode.
 * @returns {object} Payload that the token contains.
 */
exports.decodeToken = function(token) {
    return jwt.decode(token);
}

/**
 * Verifies a given token with the provided key.
 *
 * @param {string} token The token to verify.
 * @param {string} key The key for verifying the token.
 * @returns {object} The payload.
 */
exports.verifyToken = function(token, key) {
    return jwt.verify(token, key);
}
