'use strict';

/**
 * Server Dependencies
 */
let mongoose = require('./config/system/mongoose');
let restify = require('./config/system/restify');

// Mongoose and Server Initialization
mongoose.init( startServer => restify.init() );
