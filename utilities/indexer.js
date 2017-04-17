'use strict';
/*
 * Generates an inverted-index based on the wikipedia corpus 
 * structure.
 * 
 * It creates a Dictionary of all the terms in the docs, and populates
 * the postings as a js array (sparsed array), which contains the documents
 * which the terms occured in. 
 * 
 * Javascript arrays are sparsed defaultly when initialized with [],
 * this means that it re-allocates memory dynamically so we can push 
 * unlimited number of elements. 
 */

var HashMap = require('hashmap');

module.exports.generate = function(docs) {
    
    //a hash map dictionary to store all the terms and thier postings
    var dictionary = new HashMap();

    docs.forEach(function(doc){ 
        var terms = doc.tokens;

        terms.forEach(function(term){
            if(dictionary.has(term)){
                //get the postings list
                var postings = dictionary.get(term);
                postings.push(+doc.id); //cast to integer, for serializing performance

                //update postings list
                dictionary.set(term, postings);
            }else {
               var postings = [];
               postings.push(+doc.id); //cast to integer, for serializing performance

               dictionary.set(term, postings);
            }
        });
    });

    return dictionary;
}