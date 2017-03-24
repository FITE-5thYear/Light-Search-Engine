'use strict';

var parser = require('./utilities/xml-parser'),
    tokenizer = require('./utilities/tokenizer'),
    winston = require('./config/winston'),
    stopwordsMapper = require('./utilities/stopwords-mapper')();

parser
    .parseWikipediaCorpus() //parse xml to json
    .then(function(wikiDocs){
    
        winston.info('Starting tokenization & first phase cleaning...');

        wikiDocs.forEach(function(doc){
            doc.tokens = tokenizer.tokenize(doc.text);
        });

        return wikiDocs;
    })
    .then(function(wikiDocs){
        
        winston.info('Starting to remove stop words...');

        wikiDocs.forEach(function(doc){
            doc.tokens = doc.tokens.filter(function(token){
                return !stopwordsMapper.get(token);
            });
        });

        return wikiDocs
    })
    .then(function(wikiDocs){

        winston.info('Starting stemming process...');

        var stemmer = require('porter-stemmer').stemmer;

        wikiDocs.forEach(function(doc){

            var stemmedTokens = [];

            doc.tokens = doc.tokens.map(function(token){
                return stemmer(token);
            });
        });

        return wikiDocs;
    })
    .then(function(wikiDocs){

    })
    .catch(function(err){
        winston.error(err);
    });
