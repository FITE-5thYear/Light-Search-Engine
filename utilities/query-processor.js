'use strict';

var tokenizer = require('./tokenizer'),
    stemmer = require('porter-stemmer').stemmer,
    stopwordsMapper = require('./stopwords-mapper')(),
    HashMap = require('hashmap'),
    doLemmatize = require('./../config/env').lemmatize,
    db = require('./../config/sequelize'),
    math = require('mathjs');

module.exports.process = function(queryString){
    //tokenize
    var queryTokens = tokenizer.tokenize(queryString);

    //clean from stopwords
    queryTokens = queryTokens.filter(function(token){
        return !stopwordsMapper.get(token);
    });

    //stemming
    
    if(doLemmatize){ // lemmatize using NLTK
        
        var python = require('./python-consumer'),
            lemmatizationPromises = [];

        queryTokens.forEach(function(token){
            lemmatizationPromises.push(
                python.lemmatize(token)
            );
        });

        return Promise.all(lemmatizationPromises)
                .then(function(queryTokens){

                    //augment with some info about the query tokens
                    var map = new HashMap(),
                        dbPromises = [],
                        queryEntities = [],
                        nOfTokens = queryTokens.length;


                    queryTokens.forEach(function(token){
                       dbPromises.push(
                            db.PostingsList.find({
                                where : {
                                    term : token
                                },
                                raw : true
                            }).then(function(postingEntry){

                                if(postingEntry){ // if we have the term in our corpus
                                    queryEntities.push({
                                        term : token,
                                        tf : (1 / nOfTokens),
                                        df : JSON.parse(postingEntry.postings).df
                                    });
                                }else {
                                    queryEntities.push({
                                        term : token,
                                        tf : (1 / nOfTokens),
                                        df : 1
                                    });
                                }                                
                            })
                       );
                    });

                    return Promise.all(dbPromises)
                           .then(function(){
                               return queryEntities;
                           });
                      
                })
                .then(function(queryEntries){
                    //get document counts
                    return db.DocumentVectors
                             .count()
                             .then(function(count){
                                    return {
                                        documentCount : count,
                                        queryEntries : queryEntries
                                    }
                             });
                })
                .then(function(queryData){
                    //calculate query weights                    

                    queryData.queryEntries.forEach(function(datum){
                       datum.weight = datum.tf * math.log(queryData.documentCount / datum.df);
                    });

                    return queryData;
                })

    }else {
        return new Promise(function(resolve, reject){
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

            resolve(map.values());
        });
        
    }
    

    
}