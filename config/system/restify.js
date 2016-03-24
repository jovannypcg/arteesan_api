'use strict';

/**
 * Module Dependencies
 */
let restify = require('restify');
let Logger = require('bunyan');
let fs = require('fs');
// restify.CORS.ALLOW_HEADERS.push('authorization');

let walk;
//  Initializing system variables
let config = require('./../config');
// Create a Bunyan logger with useful serializers (functions that tell
// the logger how to serialize a value for that log record key to JSON).
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
    ],
    serializers: {
        req: Logger.stdSerializers.req,
        res: restify.bunyan.serializers.res,
    },
});

// Load Server Configuration
function loadServerConfig( server, callback ) {

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.jsonp());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser());

    server.use(restify.CORS({
        origins: ['*'],
        headers: ['authorization'],
        methods: ['OPTIONS','GET','POST','PUT','PATCH','DELETE']
    }));

    // Let's log every incoming request. `req.log` is a "child" of our logger
    // with the following fields added by restify:
    // - a `req_id` UUID (to collate all log records for a particular request)
    // - a `route` (to identify which handler this was routed to)
    server.pre(function (req, res, next) {
        req.log.info({url: req.url, method: req.method}, 'Started');
        return next();
    });

    // Let's log every response. Except 404s, MethodNotAllowed,
    // VersionNotAllowed -- see restify's events for these.
    server.on('after', function (req, res, route, error) {
        req.log.info({url: req.url, method: req.method}, "Finished" );
    });

    server.on('MethodNotAllowed', function (req, res, route, error) {
        if (req.method.toLowerCase() === 'options') {

        let allowHeaders = ['accept', 'accept-version', 'Content-Type', 'api-version', 'request-id', 'origin', 'x-api-version', 'x-request-id', 'authorization'];

        if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
            res.header('Access-Control-Allow-Methods', res.methods.join(', '));
            res.header('Access-Control-Allow-Origin', req.headers.origin);

            req.log.info( "Finished" );
            res.send(204);
        }else{
            req.log.info( "Finished" );
            res.send(new restify.MethodNotAllowedError());
        }
    });

    if( callback ) callback( server );
};

// Load System Routes
function loadRoutes( server, callback ) {

    // Load URLs
    let routes_path = `${__dirname}/../../routes`;

    walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            let newPath = `${path}/${file}`;
            let stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath)( server );
                }
            } else if (stat.isDirectory() && file !== 'middlewares') {
                walk(newPath);
            }
        });
    };
    walk( routes_path );

    if( callback ) callback( server );
};

// Initialize Server
module.exports.init = function() {

    //  Create Server
    let server = restify.createServer({
        log: logger,
        name: config.app.name,
    });

    loadServerConfig( server, function( server ) {
        logger.info( 'Loaded Server Configuration' );
        loadRoutes( server, function( server ){
            logger.info( 'Loaded Routes' );
        } );
    } );

    server.listen( config.port, () => logger.info('%s listening at %s', server.name, server.url) );
};
