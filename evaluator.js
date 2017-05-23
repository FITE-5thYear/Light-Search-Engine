var db = require('./config/sequelize');

var i = 0,
    results = [];

db.init(function(){
    var evalData = require('./utilities/evaluator').getEvalData(),
        cosineMatchingFunction = require('./utilities/cosine-similiarity'),
        queryProcessor = require('./utilities/query-processor');


    new Promise(function(resolve){
        return executeQuery(evalData.queries[i++], cosineMatchingFunction, queryProcessor, evalData);
    })
    .then(function(){
        
    });
});



function executeQuery(query, cosineMatchingFunction, queryProcessor, evalData){

    if(i == evalData.queries.length){
        evalData.revelances.forEach(function(revelance){
            console.log(" Query :" + revelance.queryNumber);
            console.log(" TIME revelance : " + revelance.documents);
            console.log(" Our Revelance : " + results[evalData.revelances.indexOf(revelance)].map(x => x.docId));
        });
        return ;
    }

    return queryProcessor
            .process(query)
            .then(function(tokens){
                return cosineMatchingFunction
                        .match(tokens.queryEntries)
                        .then(function(scores){
                            results.push(scores);
                            executeQuery(evalData.queries[i++], cosineMatchingFunction, queryProcessor, evalData);
                        });
            });
}