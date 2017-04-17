'use strict';

var HashMap = require('hashmap'),
    db = require('./../config/sequelize');

module.exports = function(){
  return db.PostingsList.findAll({
        attributes : ['term'],
        raw : true
  }).then(function(terms){
    var index = new HashMap();
    
    terms.forEach(function(termObj){        
        index.set(termObj.term, {});
    });  

    return index;
  });  
} 