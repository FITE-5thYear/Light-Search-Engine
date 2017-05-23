'use strict';
var db = require('./../config/sequelize'),
    math = require('mathjs'),
    HashMap = require('hashmap'),
    _ = require('lodash'),
    python = require('./python-consumer.js'),
    index = require('./index').index,
    documentVectors = require('./index').documentVectors,
    kTop = require('../config/env').k_top,
    queryProcessor = require('./../utilities/query-processor.js'),
    util = require('util'),
    cosineMatcher = require('./../utilities/cosine-similiarity');


module.exports.match = function(query, threshold){
    threshold = require('./../config/env').threshold;

    return queryProcessor
        .process(query)
        .then(function(queryData){
            console.log(queryData);
            return applyQueryReweighting(queryData, threshold);
        })
        .then(function(reweightedQuery){
            console.log("Reweighted Query:")
            console.log(reweightedQuery);

            return applyQueryExpansion(reweightedQuery, threshold);
        })                      
        .then(function(expandedQuery){
            var terms = expandedQuery.queryEntries.map((queryEntry) => queryEntry.term);

            return initQueryExpansion(terms)
                    .then(() => expandedQuery);
        })
        .then(function(expandedQuery){
            console.log("Expanded Query:");
            console.log(util.inspect(expandedQuery, false, 3));

            return applyTermWeighting(expandedQuery, threshold);
        })
        .then(function(reweightedQuery){
            console.log("Term Weighted Query:");
            console.log(util.inspect(reweightedQuery, false, 3));

            return cosineMatcher.match(reweightedQuery.queryEntries)
                    .then(function(scores){
                        return { scores : scores, query : reweightedQuery };
                    });
            
        });
}

module.exports.applyQueryReweighting = applyQueryReweighting;

module.exports.applyQueryExpansion = applyQueryExpansion;

module.exports.applyTermWeighting = applyTermWeighting;

module.exports.rankDocuments = rankDocuments;

module.exports.initQueryExpansion = initQueryExpansion;

function applyQueryReweighting(queryData, threshold){
    //1- query re-weighting

    var simliarityPromises = [],
        newQueryTerms = [];


    queryData.queryEntries  
    .forEach(function(queryEntry){
        queryEntry.newWeight = 0;

        var otherEntries = queryData.queryEntries.filter( otherEntry => queryEntry.term != otherEntry.term);

        otherEntries.forEach(function(otherEntry){
            simliarityPromises.push(                
                python.wordSimilarity(queryEntry.term, otherEntry.term, 'lin')
                      .then(function(score){
                          if(score >= threshold)                         
                            queryEntry.newWeight += otherEntry.weight * score;
                      })
            );
        });


    });

    return Promise.all(simliarityPromises)
                  .then( 
                      () => 
                      {
                         queryData.queryEntries.forEach(function(queryEntry){
                            queryEntry.weight += queryEntry.newWeight; 
                            delete queryEntry.newWeight;
                         });

                         return queryData;
                      });
}

function initQueryExpansion(queryTerms){
    var wordnet = wordnet = require('./wordnet');

    return wordnet.getTermsHyponyms(queryTerms);
}

function applyQueryExpansion(queryData, threshold){

    var wordnet = require('./wordnet'),
        synonymEntriesPromises = [],
        simliarEntries = [];

    queryData.queryEntries.forEach(function(queryEntry){
        queryEntry.synonyms = [];

        synonymEntriesPromises.push(
            wordnet.getTermSynonyms(queryEntry.term)
                   .then(function(synonyms){
                       synonyms.forEach(function(synonym){

                            if(synonym == queryEntry.term) // brought itself, skip
                                return; 

                            simliarEntries.push(
                                python.wordSimilarity(queryEntry.term, synonym, 'lin')
                                    .then(function(simliarity){
                                        if(simliarity >= threshold)
                                            queryEntry.synonyms.push(synonym);
                                    })
                            );
                       });
                   })
        );
    });

    return Promise.all(synonymEntriesPromises)
                  .then( () => { return Promise.all(simliarEntries)})
                  .then( () => {
                      //augment query entries with synonyms
                      var newQueryData = {
                          documentCount : queryData.documentCount,
                          queryEntries : []
                      };

                      queryData.queryEntries.forEach(function(queryEntry){
                        newQueryData.queryEntries.push(queryEntry);

                        //push synonyms
                        queryEntry.synonyms.forEach(function(synonym){
                            newQueryData.queryEntries.push({ term : synonym});
                        });
                      });

                      return newQueryData;
                  });
}

function applyTermWeighting(queryData, threshold){

    var weightingPromises = [];

    var wordnet = require('./wordnet');

    var hyponymsCountHashMap = new HashMap();

    queryData.queryEntries.forEach(async (queryEntry) => await wordnet.getTermHyponymsCount(queryEntry.term));        
    

    queryData.queryEntries.forEach(function(queryEntry){


        if(!queryEntry.newWeight)
            queryEntry.newWeight = 0;

        var otherEntries = queryData.queryEntries.filter( entry => entry.term != queryEntry.term);

        otherEntries.forEach(function(otherEntry){

            if(!otherEntry.weight) // skip new terms
                return;

            console.log("here");

            weightingPromises.push(
                python.wordSimilarity(queryEntry.term, otherEntry.term, 'lin')
                      .then(function(simliarity){
                            console.log("cal sim for " + queryEntry.term + " and " + otherEntry.term);

                            //check if hashmap has the value
                            if(hyponymsCountHashMap.has(otherEntry.term)){
                                var hypCount = hyponymsCountHashMap.get(otherEntry.term);

                                if(simliarity > threshold){
                                    queryEntry.newWeight += (1 / hypCount) * otherEntry.weight * simliarity;
                                }
                            }else 
                                return wordnet.getTermHyponymsCount(otherEntry.term)
                                            .then(function(hypCount){
                                                hyponymsCountHashMap.set(otherEntry.term, hypCount);

                                                console.log("cal for " + queryEntry.term + " and " + otherEntry.term);
                                                if(simliarity > threshold){
                                                    queryEntry.newWeight += (1 / hypCount) * otherEntry.weight * simliarity;
                                                }
                                            });
                      })
            );
        });        
    });

    return Promise.all(weightingPromises).then( 
        () => {
            var N = queryData.queryEntries.length;

            queryData.queryEntries.forEach(function(queryEntry){
                if(!queryEntry.weight) // new term, assign 0 to accumulate later
                    queryEntry.weight = 0;

                queryEntry.weight = (queryEntry.weight + queryEntry.newWeight) / N; // normalize by query length
            });

            return queryData;
        });
}

function rankDocuments(queryData, threshold){

    var N = queryData.documentCount,
        promises = []; // number of documents


    documentVectors.forEach(function(termsVector, docId){ // for each document
        
        termsVector.forEach(function(documentTerm){ // for each term in document

            queryData.queryEntries.forEach(function(queryEntry){ // for each term in query

                //get weight of document term
                var postingEntitiy = index.get(queryEntry.term);

                //get simliarity of the two terms
                promises.push(
                        python.wordSimilarity(documentTerm.term, queryEntry.term, 'lin')
                                .then(function(sim){
                                    documentVector.numerator += queryEntry.weight * (documentTerm.tf * math.log(postingEntity.postings.ndf)) * sim;
                                    documentVector.denumerator += queryEntry.weight +  (documentTerm.tf * math.log(postingEntity.postings.ndf));
                                })
                );

            });

        });

    });

    return Promise.all(promises).then ( () => {
        documentVector.forEach(function(documentVector){
            documentVector.weight = documentVector.numerator / documentVector.denumerator;
        });

        documentVectors.filter( documentVector => documentVector.weight > threshold);

        return _.slice(_.orderBy(documentVectors, 'weight', 'desc'), 0, kTop);
    });
    
}