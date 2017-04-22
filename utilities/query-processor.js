'use strict';

var tokenizer = require('./tokenizer'),
    stemmer = require('porter-stemmer').stemmer,
    stopwordsMapper = require('./stopwords-mapper')(),
    HashMap = require('hashmap');

module.exports.process = function(queryString){
    //tokenize
    var queryTokens = tokenizer.tokenize(queryString);

    //clean from stopwords
    queryTokens = queryTokens.filter(function(token){
        return !stopwordsMapper.get(token);
    });

    //stemming
    queryTokens = queryTokens.map(function(token){
        return stemmer(token);
    });

    //augment with some info about the query tokens
    var map = new HashMap();
    queryTokens.forEach(function(token){
        if(map.has(token)){
            var tokenObject = map.get(token);
            tokenObject.tf += 1;

            map.set(token, tokenObject);
        }
        else {
            map.set(token, {
                term : token,
                tf : 1
            });
        }
    });

    return map.values();
}