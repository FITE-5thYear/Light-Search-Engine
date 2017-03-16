'use strict';

var express = require('express'),
    indexCtr = require('./server/controllers/IndexController');

module.exports = function(app){
    app.route('/').get(indexCtr.renderIndex);
}