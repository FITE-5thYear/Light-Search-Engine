var wordNet = require('wordnet-magic'),
    wn = wordNet(require('./../config/env').wordNetPath),
    _ = require('lodash'),
    HashMap = require('hashmap'),
    hyponymsHashMap = new HashMap(),
    inited = false;

module.exports.getTermSynonyms = function(term){
    return new Promise(function(resolve, reject){
        var word = new wn.Word(term);

        word.getSynsets(function(err, data){
            if(err){
                reject(err);
                return;
            }

            var synonyms = [];console.log(data[0]);
            
            //clean word object
            data.forEach(function(synset){
                synset.words = synset.words.map(function(wordObject){
                    return wordObject.lemma;
                });
            });

            //filter: remove 2 or more words synonyms
            data.forEach(function(synset){
                synset.words = synset.words.filter(function(word){
                    return !word.includes(' ');
                });
            });

            data.forEach(function(synset){
               synonyms = _.union(synonyms, synset.words);
            });

            resolve(synonyms);
        });
    });
}

module.exports.getTermHyponymsCount = function(term){

    if(hyponymsHashMap.has(term)){

        console.log("getTermHyponymsCount " + term + " from hashmap");
        
        return new Promise(function(resolve){
            resolve(hyponymsHashMap.get(term));
        });
    }else {

        console.log("getTermHyponymsCount " + term + " from wordnet");

        var hyponymsPromises = [];

        return (new wn.Word(term))
                .getSynsets()
                .then( synsets => {
                    console.log("got synset for " + term);

                    synsets.forEach(function(synset){
                        hyponymsPromises.push(
                            synset.getHyponyms()
                        )         
                    });            

                    return Promise.all(hyponymsPromises)
                        .then(hyponyms => {
                                console.log("got hyponym for " + term + " count : " + hyponyms.length);

                                hyponymsHashMap.set(term, hyponyms.length);

                                return hyponyms.length;
                        });
                });    

    }
}

module.exports.getTermsHyponyms = function(terms){
    var promises = [];


    jsonHashMap = require('./../hashmap.json');
    
    if(!inited){
        jsonHashMap.forEach(function(entry){
            hyponymsHashMap.set(entry.key, entry.value);
        });
        inited = true;
    }
    
    terms.forEach(function(term){
        if(hyponymsHashMap.has(term)){

            console.log("getTermHyponymsCount " + term + " from hashmap");
            
            promises.push( 
                new Promise(function(resolve){
                    resolve(hyponymsHashMap.get(term));
                })
            );
        }else {

            console.log("getTermHyponymsCount " + term + " from wordnet");

            var hyponymsPromises = [];

            promises.push(
            (new wn.Word(term))
                    .getSynsets()
                    .then( synsets => {
                        console.log("got synset for " + term);

                        synsets.forEach(function(synset){
                            hyponymsPromises.push(
                                synset.getHyponyms()
                            )         
                        });            

                        return Promise.all(hyponymsPromises)
                            .then(hyponyms => {
                                    console.log("got hyponym for " + term + " count : " + hyponyms.length);

                                    hyponymsHashMap.set(term, hyponyms.length);

                                    return hyponyms.length;
                            });
                    })
            );
        }
    });
    
    return Promise.all(promises);

}

module.exports.writeHyponymsHashMap = function(){
    var arraied = [];

    hyponymsHashMap.forEach(function(value, key){
        arraied.push({ key : key, value : value});
    });

    var fs = require('fs');

    fs.writeFile('hashmap.json', JSON.stringify(arraied), (err) => console.log(err));
}

function initHashMap(){
    
}

initHashMap();