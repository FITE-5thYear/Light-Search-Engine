'use strict';

var express = require('express'),
    config = require('./config'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    winston = require('./winston'),
    path = require('path');

module.exports = function(app){
    winston.info('Initializing Express...');

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    config.getGlobbedFiles('./modules/*/app.js').forEach(function(routePath){
        require(path.resolve(routePath))(app);
    });

    //setting static modules public folder
    config.getDirectories(config.rootPath + '/modules').forEach(function(pack){
        app.use('/' + pack, express.static(config.rootPath + '/modules/' + pack + '/public'));
    });

    app.use('/bower_components/', express.static(config.rootPath + '/bower_components'));
}