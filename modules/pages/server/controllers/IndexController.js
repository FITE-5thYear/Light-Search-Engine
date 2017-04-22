'use strict';

var path = require('path'),
    queryProcessor = require('./../../../../utilities/query-processor'),
    matchingFunction = require('./../../../../utilities/cosine-similiarity'),
    winston = require('./../../../../config/winston'),
    Mustache = require('mustache'),
    fs = require('fs'),
    misc = require('./../../../../utilities/misc');

module.exports.renderIndex = function(req, res){
    res.sendFile(path.resolve(__dirname + '//..//views//index.html'));
}

module.exports.search = function(req, res){
    console.log(req.query);

    var tokens = queryProcessor.process(req.query.input);

    matchingFunction
        .match(tokens)
        .then(function(scores){
            return misc.getDocumentsById(scores);
        })
        .then(function(results){
            var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//results.html'), 'utf-8');

            res.set('Content-Type', 'text/html');
            return res.send(Mustache.render(templateString, {results : results}));            
        })
        .catch(function(err){
            winston.error(err);
            return res.status(500).end();
        });
    
}