'use strict';
/* TODO: needs review
 *
 * Generates an inverted-index based on the wikipedia corpus 
 * structure.
 * 
 * It creates a Dictionary of all the terms in the docs, each term has :
 * 1- a js array (sparsed array), that contains the documents
 *    which the terms occured in, this array is called Postings List.
 * 2- each term has N / df factor, where df is the Document Frequency 
 *    for the given term i.e the postings list length.
 * 3- each term has a tf as Term Frequency.
 * 4- each posting entry has TFd as Term Frequency for the given Document.
 * 
 * Javascript arrays are sparsed defaultly when initialized with [],
 * this means that it re-allocates memory dynamically so we can push 
 * unlimited number of elements. 
 */

var HashMap = require('hashmap');

module.exports.generate = function(docs) {
    
    //a hash map dictionary to store all the terms and thier postings
    var dictionary = new HashMap(),
        N = docs.length; // number of documents we have in the collection

    docs.forEach(function(doc){ 
        var terms = doc.tokens;

        terms.forEach(function(term){
            if(term == 'buffalo') 

            if(dictionary.has(term)){
                //get the term data
                let termData = dictionary.get(term);

                //have the term already occured in the document?
                var existedPostingEntry = null;
                for(var i =0; i < termData.postings.length; i++){
                    let postingEntry = termData.postings[i];
                    if(postingEntry.docId == doc.id){
                        existedPostingEntry = postingEntry;
                        break;
                    }
                }

                if(existedPostingEntry){ // already occured in the current doc
                    existedPostingEntry.tfd += 1;
                }else {
                    let newPostingEntry = {
                        docId : +doc.id,
                        tfd : 1
                    }

                    termData.df += 1;

                    termData.postings.push(newPostingEntry);
                }

                termData.tf += 1;
                termData.ndf = N / termData.df; // no need to calc if not new entry... TODO 

                //update postings list
                dictionary.set(term, termData);
            }else {
               let termData = { // each term should have: 
                      postings : [], // postings
                      tf : 1, //cast to integer, for better serializing performance
                      ndf : N, // N / df
                      df : 1  // Document Frequency                     
                   };

                let postingEntry = {
                    docId : +doc.id,
                    tfd : 1 // term frequency in document 
                }

               termData.postings.push(postingEntry); 

               dictionary.set(term, termData);
            }
        });
    });

    return dictionary;
}