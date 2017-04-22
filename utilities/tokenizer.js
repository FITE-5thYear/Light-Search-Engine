'use strict';

var q = require('q'),
    whitespaceRx = /\s/g,
    newlineRx = /\/n/g,
    onecharRx = /[a-z]|[A-Z]/,
    uglyCharsRx = /\?|-|=|:|\/|\"|\.|,|!|@|#|\$|%|\^|&|\*|(|)|{|}/g;

module.exports.tokenize = function(input){
    var tokenizer = new WordTokenizer();

    return cleanTokens(tokenizer.tokenize(input));
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

/*
 * Natural, https://github.com/NaturalNode/natural/blob/master/lib/natural/tokenizers/tokenizer.js
 *
 */


var util = require("util"),
    _ = require('underscore')._;

var Tokenizer = function() {
};

Tokenizer.prototype.trim = function(array) {
  while (array[array.length - 1] == '')
    array.pop();

  while (array[0] == '')
    array.shift();

  return array;
};

// Expose an attach function that will patch String with new methods.
Tokenizer.prototype.attach = function() {
  var self = this;

  String.prototype.tokenize = function() {
    return self.tokenize(this);
  }
};

Tokenizer.prototype.tokenize = function() {};

// Base Class for RegExp Matching
var RegexpTokenizer = function(options) {
    var options = options || {};
    this._pattern = options.pattern || this._pattern;
    this.discardEmpty = options.discardEmpty || true;

    // Match and split on GAPS not the actual WORDS
    this._gaps = options.gaps;
    
    if (this._gaps === undefined) {
        this._gaps = true;
    }
};

util.inherits(RegexpTokenizer, Tokenizer);

RegexpTokenizer.prototype.tokenize = function(s) {
    var results;

    if (this._gaps) {
        results = s.split(this._pattern);
        return (this.discardEmpty) ? _.without(results,'',' ') : results;
    } else {
        return s.match(this._pattern);
    }
};

exports.RegexpTokenizer = RegexpTokenizer;

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordTokenizer().tokenize("She said 'hello'.")
 *      ['She', 'said', 'hello']
 * 
 */
var WordTokenizer = function(options) {
    this._pattern = /[^A-Za-zА-Яа-я0-9_]+/;
    RegexpTokenizer.call(this,options)
};

util.inherits(WordTokenizer, RegexpTokenizer);

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordPunctTokenizer().tokenize("She said 'hello'.")
 *      ["She","said","'","hello","'","."]
 * 
 */
var WordPunctTokenizer = function(options) {
    this._pattern = new RegExp(/(\w+|[а-я0-9_]+|\.|\!|\'|\"")/i);
    RegexpTokenizer.call(this,options)
};

util.inherits(WordPunctTokenizer, RegexpTokenizer);