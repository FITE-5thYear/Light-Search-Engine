'use strict';

var HashMap = require('hashmap'),
    fs = require('fs');

module.exports = function(){
    
    var map = new HashMap(),
        stopWordsFile = fs.readFileSync('resources/english-stop-words', 'utf-8'),
        stopWords = stopWordsFile.split(/\r?\n/);

    stopWords.forEach(function(word){
        map.set(word, word);
    });

    return map;
}