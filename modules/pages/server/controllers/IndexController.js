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

module.exports.renderCourserData = function(req, res){
    var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//courser-data.html'), 'utf-8');

    res.set('Content-Type', 'text/html');
    return res.send(Mustache.render(templateString, { data : require('./../../../../coursera-data.json') }));            
}

module.exports.renderEvalChart = function(req, res){
    res.sendFile(path.resolve(__dirname + '//..//views//evaluate_chart.html'));
}

module.exports.search = function(req, res){
    winston.info("Query : " + req.query.input);
    winston.info("Method : " + req.query.method);

    if(req.query.method == "cosine"){
        var processedQuery;
        
        queryProcessor
            .process(req.query.input)
            .then(function(tokens){
                return cosineMatchingFunction
                        .match(tokens.queryEntries)
                        .then(function(result){
                            processedQuery = result.query || [];

                            return misc.getDocumentsById(result.scores);
                        })
                        .then(function(results){
                            var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//results.html'), 'utf-8');

                            res.set('Content-Type', 'text/html');
                            return res.send(Mustache.render(templateString, {results : results , query : JSON.stringify(processedQuery.map(x => x.term ))}));            
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
                processedQuery = result.query || [];
                
                return misc.getDocumentsById(result.scores);
            })
            .then(function(results){
                console.log(processedQuery);

                var templateString = fs.readFileSync(path.resolve(__dirname + '//..//views//results.html'), 'utf-8');

                res.set('Content-Type', 'text/html');
                return res.send(Mustache.render(templateString, {results : results, query : JSON.stringify(processedQuery.queryEntries.map(x => x.term))}));            
            })
            .catch(function(err){
                winston.error(err);
                return res.status(500).end();
            });;
    }
    

    
    
}