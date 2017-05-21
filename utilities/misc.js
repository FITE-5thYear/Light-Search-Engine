'use strict';
var parser = require('./corpus-parser'),
    _ = require('lodash');

module.exports.tickerToString = function(ticker){
    return ticker.parse(ticker.max());
}

module.exports.getDocumentsById = function(docs){

    var docsIds = docs.map(function(doc){ return doc.docId; });

    return parser.parseCorpus()
                .then(function(docs){
                    docs = docs.filter(function(doc){
                            return _.includes(docsIds, +doc.id); 
                        });

                    return docs;
                });
}
