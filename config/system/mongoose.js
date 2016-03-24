'use strict';

/**
 * Module Dependencies
 */
let mongoose = require('mongoose');
let Logger = require('bunyan');
let fs = require('fs');

let walk;
//  Initializing system variables
let config = require('./../config');
// Create a Bunyan logger
let logger = new Logger({
    name: config.app.name,
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path: `./logs/${config.app.name}.log`,
            level: 'trace'
        }
    ]
});

// Load the mongoose models
function loadModels( callback ) {

    let models_path = `${__dirname}/../../models`;

    walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            let newPath = `${path}/${file}`;
            let stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };
    walk( models_path );

    if (callback) callback();
};

// Connect to DB
module.exports.connect = function( callback ) {

    let db = mongoose.connect( config.dbMongo.uri, config.dbMongo.options, function(err) {
        if ( err ) {
            logger.warn( 'Could not connect to MongoDB!' );
            logger.error( err );
        } else {

            logger.info( 'MongoDB connection established' );
            // Enabling mongoose debug mode if required
            mongoose.set( 'debug', config.dbMongo.debug );

            // Call callback FN
            if (callback) callback( db );
        }
    } );
};

// Disconnect from DB
module.exports.disconnect = function( callback ) {

    mongoose.disconnect( function( err ) {
        if ( err ) {
            logger.warn( 'Could not disconnect to MongoDB!' );
            logger.error( err );
        } else {

            logger.info( 'Disconnected from MongoDB.' );

            if (callback) callback();
        }
    } );
};

// Initialize Mongoose
module.exports.init = function( callback ) {

    this.connect( function( db ){
        loadModels( function(){
            logger.info( 'Loaded Models' );
            if (callback) callback();
        } );
    } );
};
