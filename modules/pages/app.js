'use strict';

var express = require('express'),
    indexCtr = require('./server/controllers/IndexController');

module.exports = function(app){

    app.route('/search').get(indexCtr.search);

    app.route('/').get(indexCtr.renderIndex);
    
}