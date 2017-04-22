'use strict';

var express = require('express'),
    config = require('./config/config'),
    winston = require('./config/winston'),
    sequelize = require('./config/sequelize');

createApp();

function createApp(){

    sequelize.init(function(){
        
        var app = express();
        require('./config/express')(app);


        app.listen(config.port);
        winston.info("App started and running on port: " + config.port);
        
        require('./utilities/index')().then(function(index){
            //augmenting every request to /search endpoint with the index
            //TODO: remove
            app.use('/search', function(req, res, next){
                req.index = index;
                next();
            });
        });
    });    
}