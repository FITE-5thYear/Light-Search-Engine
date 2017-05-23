'use strict';

var path = require('path'),
    queryProcessor = require('./../../../../utilities/query-processor'),
    cosineMatchingFunction = require('./../../../../utilities/cosine-similiarity'),
    semanticMatchingFunction = require('./../../../../utilities/semantic-simliarity'),
    winston = require('./../../../../config/winston'),
    Mustache = require('mustache'),
    fs = require('fs'),
    misc = require('./../../../../utilities/misc');

module.exports.renderIndex = function(req, res){
    res.sendFile(path.resolve(__dirname + '//..//views//index.html'));
}

module.exports.search = function(req, res){
    winston.info("Query : " + req.query.input);
    winston.info("Method : " + req.query.method);

    if(req.query.method == "cosine"){
        queryProcessor
            .process(req.query.input)
            .then(function(tokens){
                return cosineMatchingFunction
                        .match(tokens.queryEntries)
                        .then(function(result){
                            return misc.getDocumentsById(result);
                        })
                        .then(function(results){
                            var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//results.html'), 'utf-8');

                            res.set('Content-Type', 'text/html');
                            return res.send(Mustache.render(templateString, {results : results , query:req.query.input}));            
                        });
            })
            .catch(function(err){
                winston.error(err);
                return res.status(500).end();
            });
    }else { //semantic
        var processedQuery;

        semanticMatchingFunction
            .match(req.query.input)
            .then(function(result){
                processedQuery = result.query;
                
                return misc.getDocumentsById(result.scores);
            })
            .then(function(results){
                console.log(processedQuery);

                var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//results.html'), 'utf-8');

                res.set('Content-Type', 'text/html');
                return res.send(Mustache.render(templateString, {results : results}));            
            })
            .catch(function(err){
                winston.error(err);
                return res.status(500).end();
            });;
    }
    

    
    
}