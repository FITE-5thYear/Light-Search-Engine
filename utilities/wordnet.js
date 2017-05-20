var wordNet = require('wordnet-magic'),
    wn = wordNet(require('./../config/env').wordNetPath),
    _ = require('lodash');

module.exports.getTermSynonyms = function(term){
    return new Promise(function(resolve, reject){
        var word = new wn.Word(term);

        word.getSynsets(function(err, data){
            if(err){
                reject(err);
                return;
            }

            var synonyms = [];
            
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