'use strict';
var xmlParser = require('./xml-parser'),
    _ = require('lodash');

module.exports.tickerToString = function(ticker){
    return ticker.parse(ticker.max());
}

module.exports.getDocumentsById = function(docs){

    var docsIds = docs.map(function(doc){ return doc.docId; });

    return xmlParser.parseWikipediaCorpus('./../corpus/enwikisource.xml')
                .then(function(docs){
                    docs = docs.filter(function(doc){
                            return _.includes(docsIds, +doc.id); 
                        });

                    return docs;
                });
}