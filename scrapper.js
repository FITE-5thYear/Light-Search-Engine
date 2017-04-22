'use strict';

var parser = require('./utilities/xml-parser'),
    tokenizer = require('./utilities/tokenizer'),
    winston = require('./config/winston'),
    stopwordsMapper = require('./utilities/stopwords-mapper')(),
    T = require('exectimer'),
    Tick = T.Tick;

parser
    .parseWikipediaCorpus('/../corpus/enwikisource.xml') //parse xml to json
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
    })
    .then(function(wikiDocs){
        
        var tick = new Tick('indexing');
        tick.start();

        winston.info('Starting to generate inverted index...');

        var invertedIndex = require('./utilities/indexer').generate(wikiDocs);

        tick.stop();
        winston.info('Last process elapsed ' + T.timers.indexing.parse(T.timers.indexing.max()));
        
        winston.info('Starting to populate persistent storage with inverted index...');

        var db = require('./config/sequelize');

        db.init(function(db){

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
              });

        });
        
    })
    .catch(function(err){
        winston.error(err);
    });
