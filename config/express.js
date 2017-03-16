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
}