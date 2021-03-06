'use strict';
var db = require('./../config/sequelize'),
    math = require('mathjs'),
    HashMap = require('hashmap'),
    _ = require('lodash'),
    documentVectors = require('./index').documentVectors,
    kTop = require('../config/env').k_top;

module.exports.match = function(queryTerms, dictionary){
    var scores = new HashMap();

    var _queryTerms = queryTerms.map(function(queryTerm){ return queryTerm.term; });

    return db.PostingsList.findAll({
        where : {
            term : _queryTerms
        },
        attributes : ['term', 'postings'],
        raw : true
    }).then(function(termsData){
        
        if(termsData.length == 0) //not found in our corpus
            return [];

        termsData.forEach(function(_termData){
                _termData.postings = JSON.parse(_termData.postings);
        });

        queryTerms.forEach(function(queryTerm){
            
            //fetch term postings and factors
            let termData = null;
            termsData.forEach(function(_termData){
               if(queryTerm.term == _termData.term)
                    termData = _termData;
            });

            
            if(!termData) //we don't have the term in the index, skip it
                return;
            
            //calculate idf of term            
            let idf = math.log(termData.postings.ndf);

            //calculate query term weight Wt,q
            //Wt,q = tf x idf  : the query is considered a single document in a collection
            let wTQ = queryTerm.tf * idf;

            if(queryTerm.weight) // the queryTerm holds weight
                wTQ = queryTerm.weight;


            //for each pair of (d, TFt,d)
            //calculate term weight WFt,d            
            termData.postings.postings.forEach(function(postingEntity){
                let wTD = postingEntity.tfd;

                //score of document = Wt,q x Wt,d
                let score = wTQ * wTD;

                if(scores.has(postingEntity.docId)){
                    var scoreEntry = scores.get(postingEntity.docId);

                    scoreEntry.score += score;

                    scores.set(postingEntity.docId, scoreEntry);
                }else 
                    scores.set(postingEntity.docId, { docId : postingEntity.docId, score : score });
                
            });
            
        });


        scores.forEach(function(score){
            var documentLength = documentVectors.get(score.docId+'').length;

            score.score = score.score / documentLength;
        });

        //TODO: * use priority queue
        return { scores : _.slice(_.orderBy(scores.values(), 'score', 'desc'), 0, kTop), query : queryTerms , nRetrievedDocs : scores._count };

    });
}

