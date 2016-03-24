'use strict';

/**
 * Module dependencies.
 */
let fs = require('fs'),
    path = require('path');

/**
 * Initialize global configuration
 */
let initGlobalConfig = function () {
    let config = {};

    // Get the current config
    let environmentConfig = require(path.join(process.cwd(), 'config/env/system_variables')) || {};

    // We only extend the config object with the local.js custom/local environment if exist
    Object.assign( config, environmentConfig, (fs.existsSync(path.join(process.cwd(), `config/env/host_system_variables.js`)) && require(path.join(process.cwd(), `config/env/host_system_variables.js`))) || {} );

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
