var db = require('./config/sequelize'),
    _ = require('lodash');

var i = 0,
    results = [];

db.init(function(){
    var evalData = require('./utilities/evaluator').getEvalData(),
        cosineMatchingFunction = require('./utilities/cosine-similiarity'),
        queryProcessor = require('./utilities/query-processor');


    new Promise(function(resolve){
        return executeQuery(evalData.queries[0], cosineMatchingFunction, queryProcessor, evalData);
    })
    .then(function(){
        
    });
});



function executeQuery(query, cosineMatchingFunction, queryProcessor, evalData){

    if(i == evalData.queries.length){
        evalData.revelances.forEach(function(revelance){
            console.log(" Query :" + revelance.queryNumber);
            console.log(" TIME revelance : " + revelance.documents);
            try{
                console.log(" Our Revelance : " + results.scores[evalData.revelances.indexOf(revelance)].map(x => x.docId));
            }catch(e) {}
        });

        i = 0;
        results = [];

        console.log("# Semantic Evaluation: \n#########################");
        
        var matchingFunction  = require('./utilities/semantic-simliarity');
        return executeQuerySemantic(evalData.queries[0], matchingFunction, queryProcessor, evalData);
    }

    return queryProcessor
            .process(query)
            .then(function(tokens){
                return cosineMatchingFunction
                        .match(tokens.queryEntries)
                        .then(function(result){
                            results.push(result);
                            executeQuery(evalData.queries[i++], cosineMatchingFunction, queryProcessor, evalData);
                        });
            });
}

function executeQuerySemantic(query, matchingFunction, queryProcessor, evalData){
    if(i == evalData.queries.length){
        require('./utilities/wordnet').writeHyponymsHashMap();

        for(let i = 0; i < results.length; i++){
            console.log(" Query :" + evalData.revelances[i].queryNumber);
            console.log(" TIME revelance : " + evalData.revelances[i].documents);
            console.log(" Our Revelance : " + results[i].scores.map(x => x.docId));
        }

        return calculateMeasures(evalData); // calculate precision & recall
    }

    return matchingFunction.match(query).then(function(result){
        results.push(result);
        return executeQuerySemantic(evalData.queries[i++], matchingFunction, queryProcessor, evalData);
    });
}


function calculateMeasures(evalData){
    var measures = [];

    for(let i = 0; i < results.length; i ++){
        let revelance = evalData.revelances[i],
            relevantItemsRetrieved = _.intersection(revelance.documents, results[i].scores.map(x => x.docId +'')).length,
            retrievedItems = results[i].nRetrievedDocs,
            relevantItems = evalData.revelances[i].documents.length;

        measures.push({
            relevantItemsRetrieved : relevantItemsRetrieved,
            retrievedItems : retrievedItems,
            relevantItems : relevantItems,
            presision : relevantItemsRetrieved / retrievedItems,
            recall : relevantItemsRetrieved / relevantItems,
            query : evalData.revelances[i].queryNumber
        });

    }

    require('fs').writeFile('./evals.json', JSON.stringify(measures));
}