'use strict';

var q = require('q'),
    whitespaceRx = /\s/g,
    newlineRx = /\/n/g,
    onecharRx = /[a-z]|[A-Z]/,
    uglyCharsRx = /\?|-|=|:|\/|\"|\.|,|!|@|#|\$|%|\^|&|\*|(|)|{|}/g;

module.exports.tokenize = function(input){
    var _tokenizer = require('node-tokenizer');
    _tokenizer.debug = false;

    _tokenizer.rule('newline', /^\n/);
    _tokenizer.rule('whitespace', /^\s+/);
    _tokenizer.rule('word', /^[^\s]+/);

    return cleanTokens(_tokenizer.tokenize(input));
}

function cleanTokens(tokens){
    return tokens.filter(function(token){
        
        return !token.match(whitespaceRx) 
               && !token.match(newlineRx)
               && token.length != 0     

    }).map(function(token){
        return token.toLowerCase().replace(uglyCharsRx, "");
    });    
}