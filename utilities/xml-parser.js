'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    xmlParser = new xml2js.Parser(),
    winston = require('../config/winston'),
    q = require('q');

module.exports.parseWikipediaCorpus = function(){
    return readAndParseXML(__dirname + '/../corpus/enwikisource.xml')
                .then(function(result){
                    return cleanWikipediaXMLTree(result); 
                })
                .catch(function(err){
                        winston.error(err);
                });    
}

function readAndParseXML(path){
    var deferred = q.defer();

    winston.info('Starting to parse file : [' + path + ']');
    
    fs.readFile(path, function(err, data){
        if(err){
            deferred.reject(err);
        }

        xmlParser.parseString(data, function(err, result){
            winston.info('Parsing xml file done.');

            if(err){
                deferred.reject(err);
            }

            deferred.resolve(result);
            
        });
    });

    return deferred.promise;
}

function cleanWikipediaXMLTree(xmlObject){
    //extract id, title and text of every page
    winston.info('Cleaning XML Tree...');
    
    var pagesTree = xmlObject.mediawiki.page,
        newTree = [];

    pagesTree.forEach(function(page){
        newTree.push({
            id : page.id[0],
            title : page.title[0],
            text : page.revision[0].text[0]._
        });
    });

    return newTree;
}