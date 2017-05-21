'use strict';

var path = require('path'),
    queryProcessor = require('./../../../../utilities/query-processor'),
    matchingFunction = require('./../../../../utilities/cosine-similiarity'),
    winston = require('./../../../../config/winston'),
    Mustache = require('mustache'),
    fs = require('fs'),
    misc = require('./../../../../utilities/misc'),
    evaluater = require('./../../../../utilities/evaluator'),
    async = require('async');

 evaluater.init();

module.exports.evaluate = function(req, res){
    var queriesArray = new Array();
   
    evaluater.quriesHashMap.forEach(function(value,key) {
        queryProcessor.process(value.text).then(function(tokens){
            queriesArray.push({
                id: key,
                tokens: tokens
            });
        });
    });

    async.map(queriesArray,processQueryToken, function(err,results) {
        if(err) {
            console.log(err);
        } else {
            console.log(results);
            var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//evaluate.html'), 'utf-8');
            res.set('Content-Type', 'text/html');
            return res.send(Mustache.render(templateString));
        }
    });
}


var processQueryToken = function(query,callback){
    matchingFunction.match(query.tokens).then(function(results){

        var queryObject = evaluater.quriesHashMap.get(query.id);
        var score = new Object();
        
        score.relevant_items_retrieved  = 0;
        score.retrieved_items           = 10;
        score.relevant_items            = queryObject.relevanceDocs.length;

        queryObject.relevanceDocs.forEach(function(docId){
            results.forEach(function(resultDoc){
                if (resultDoc.docId == docId){
                    score.relevant_items_retrieved++;
                }
            });
        });

        callback(null,score);

    });
}