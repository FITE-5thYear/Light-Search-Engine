'use strict';

var express = require('express'),
    config = require('./config/config'),
    winston = require('./config/winston');

createApp();




function createApp(){
    var app = express();
    require('./config/express')(app);

    app.listen(config.port);
    winston.info("App started and running on port: " + config.port);

}


