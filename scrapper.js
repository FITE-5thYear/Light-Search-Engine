'use strict';

var parser = require('./utilities/corpus-parser'),
    tokenizer = require('./utilities/tokenizer'),
    winston = require('./config/winston'),
    stopwordsMapper = require('./utilities/stopwords-mapper')(),
    T = require('exectimer'),
    Tick = T.Tick,
    doLemmatize = require('./config/env.js').lemmatize,
    async = require('async');

parser
    .parseCorpus()
    .then(function(wikiDocs){
        
        var tick = new Tick('tokenization');
        tick.start();

        winston.info('Starting tokenization & first phase cleaning...');

        for(let i = 0; i < wikiDocs.length; i++)
            wikiDocs[i].tokens = tokenizer.tokenize(wikiDocs[i].text);

        tick.stop();
        winston.info('Last process elapsed ' + T.timers.tokenization.parse(T.timers.tokenization.max()));
        
        return wikiDocs;
    })
    .then(function(wikiDocs){
        
        var tick = new Tick('stopWords');
        tick.start();

        winston.info('Starting to remove stop words...');

        wikiDocs.forEach(function(doc){
            doc.tokens = doc.tokens.filter(function(token){
                return !stopwordsMapper.get(token);
            });
        });

        tick.stop();
        winston.info('Last process elapsed ' + T.timers.stopWords.parse(T.timers.stopWords.max()));

        return wikiDocs
    })
    .then(function(wikiDocs){

        var tick = new Tick('stemming');
        tick.start();

        winston.info('Starting stemming process...');

        if(!doLemmatize){
            var stemmer = require('porter-stemmer').stemmer;

            wikiDocs.forEach(function(doc){

                var stemmedTokens = [];

                doc.tokens = doc.tokens.map(function(token){
                    return stemmer(token);
                });
            });

            tick.stop();
            winston.info('Last process elapsed ' + T.timers.stemming.parse(T.timers.stemming.max()));        

            return wikiDocs;

        }else { // use NLTK lemmatization
            var outerPromises = [];
            
            var python = require('./utilities/python-consumer');            
            
            wikiDocs.forEach(function(doc){                

                var  innerPromises = [];

                doc.tokens.forEach(function(token){
                    innerPromises.push(python.lemmatize(token));
                });

                outerPromises.push(
                    Promise.all(innerPromises).then(function(lemmatizedTokens){                        
                        doc.tokens = lemmatizedTokens;
                    })
                );
                
            });

            return Promise.all(outerPromises).then(function(){
                python.end(); // ugly af!

                tick.stop();
                winston.info('Last process elapsed ' + T.timers.stemming.parse(T.timers.stemming.max()));        

                return wikiDocs;
            });
        }
        
    })
    .then(function(wikiDocs){
        
        var tick = new Tick('indexing');
        tick.start();

        winston.info('Starting to generate inverted index...');

        var indexes = require('./utilities/indexer').generate(wikiDocs)

        var invertedIndex = indexes.invertedIndex;

        tick.stop();
        winston.info('Last process elapsed ' + T.timers.indexing.parse(T.timers.indexing.max()));
        
        var db = require('./config/sequelize');

        db.init(function(db){

            winston.info('Clearing index');

            db.PostingsList.destroy({
                where: {},
                truncate: true
            });

            winston.info('Starting to populate persistent storage with inverted index...');
            
            var tick = new Tick('storing');

            tick.start();

            var _ = require('lodash'),
                bulk = [];

            invertedIndex.forEach(function(postings, term){

                bulk.push(
                    db.PostingsList.create({
                        term : term,
                        postings : postings
                    })
                );
            });

            Promise.all(bulk)
              .then(function(){
                  tick.stop();
                  winston.info('Last process elapsed ' + T.timers.storing.parse(T.timers.storing.max()));                                    

                  populateDocumentVectors(db, indexes.documentsVectors);
              });

        });
        
    })
    .catch(function(err){
        winston.error(err);
    });




function populateDocumentVectors(db, documentsVectors) {
    winston.info('Starting to populate persistent storage with document vectors...');
    var tick = new Tick('storing_document_vectors');
    tick.start();


    // documentVectors is a hash map
    // key is document id
    // value is a hash map of terms each key is the term and each value is tf in the document

    var bulk = [];

    documentsVectors.forEach(function(terms, documentId){
        
        var vector = [];

        terms.forEach(function(tf, term){
            vector.push({
                term : term,
                tf : tf
            });  
        });

        bulk.push(
            db.DocumentVectors.create({
                docId : documentId,
                termsVector : vector 
            })
        );
    });

    Promise.all(bulk)
           .then(function(){
                tick.stop();
                 winston.info('Last process elapsed ' + T.timers.storing_document_vectors.parse(T.timers.storing_document_vectors.max()));
           });
}
