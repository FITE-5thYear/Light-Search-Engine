'use strict';

var HashMap = require('hashmap'),
    db = require('./../config/sequelize'),
    index = new HashMap(),
    documentVectors = new HashMap();

module.exports.index = index;
module.exports.documentVectors = documentVectors;

initIndex();
initDocumentVectors();

function initIndex(){
  return db.PostingsList.findAll({
        raw : true
  }).then(function(_index){
    
    _index.forEach(function(termObj){        
        index.set(termObj.term, JSON.parse(termObj.postings));
    });  

    return index;
  });  
}

function initDocumentVectors(){
  return db.DocumentVectors.findAll({
    raw : true
  }).then(function(_documentVectors){

    _documentVectors.forEach(function(documentVector){
         documentVectors.set(documentVector.docId, JSON.parse(documentVector.termsVector));
    });
  });  
}