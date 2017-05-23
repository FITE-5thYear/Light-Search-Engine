'use strict';
var parser = require('./corpus-parser'),
    _ = require('lodash');

module.exports.tickerToString = function(ticker){
    return ticker.parse(ticker.max());
}

module.exports.getDocumentsById = function(_docs){

    var docsIds = _docs.map(function(doc){ return doc.docId; });

    return parser.parseCorpus()
                .then(function(docs){
                    var results = [];
                    docsIds.forEach(function(docId){
                        var wantedDoc = docs.filter(doc => +doc.id == docId)[0];

                        results.push( { id : docId, text : wantedDoc.text, title : wantedDoc.title});
                    });

                    //docs = docs.filter(function(doc){
                      //      return _.includes(docsIds, +doc.id); 
                        //});

                    return results;
                });
}
