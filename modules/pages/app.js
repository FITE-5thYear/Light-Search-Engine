'use strict';

var express = require('express'),
    indexCtr = require('./server/controllers/IndexController'),
    evaluateCtr = require('./server/controllers/EvaluateController');

module.exports = function(app){

    app.route('/search').get(indexCtr.search);

    app.route('/evaluate').get(evaluateCtr.evaluate);

    app.route('/').get(indexCtr.renderIndex);
    
    app.route('/eval_chart').get(indexCtr.renderEvalChart);

    app.route('/coursera-data').get(indexCtr.renderCourserData);
    
}