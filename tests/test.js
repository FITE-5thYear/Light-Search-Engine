var queryProcessor = require('./../utilities/query-processor.js'),
    sequelize = require('./../config/sequelize'),    
    util = require('util');

    sequelize.init(function(){
        matcher = require('./../utilities/semantic-simliarity'),
        cosineMatcher = require('./../utilities/cosine-similiarity');

        //matcher.match('Government supported agencies and projects dealing with information dissemination');
        queryProcessor.process('Government supported agencies and projects dealing with information dissemination')
                      .then(function(queryData){
                        console.log(queryData);
                        return matcher.applyQueryReweighting(queryData, 0.8);
                      })
                      .then(function(reweightedQuery){
                        console.log("Reweighted Query:")
                        console.log(reweightedQuery);

                        return matcher.applyQueryExpansion(reweightedQuery, 0.8);
                      })                      
                      .then(function(expandedQuery){
                        var terms = expandedQuery.queryEntries.map((queryEntry) => queryEntry.term);

                        return matcher.initQueryExpansion(terms)
                              .then(() => expandedQuery);
                      })
                      .then(function(expandedQuery){
                        console.log("Expanded Query:");
                        console.log(util.inspect(expandedQuery, false, 3));

                        return matcher.applyTermWeighting(expandedQuery, 0.8);
                      })
                      .then(function(reweightedQuery){
                        console.log("Term Weighted Query:");
                        console.log(util.inspect(reweightedQuery, false, 3));

                        return cosineMatcher.match(reweightedQuery.queryEntries);
                      })
                      .then(function(documents){
                        documents.forEach( doc => console.log(doc));//console.log("id : " + doc.docId + " weight :" + doc.weight));
                      });
    });
    
    
    