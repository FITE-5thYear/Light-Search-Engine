'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    xmlParser = new xml2js.Parser(),
    winston = require('../config/winston'),
    q = require('q'),
    config = require('../config/config');

module.exports.parseCorpus = function(){
    var corpusDir = __dirname + '/../corpus/';
    if (config.corpus == "enwikisource.xml"){
        return readAndParseXML(corpusDir + config.corpus)
                    .then(function(result){
                        return cleanWikipediaXMLTree(result); 
                    })
                    .catch(function(err){
                            winston.error(err);
                    }); 
    }

    if (config.corpus == "cran"){
        return readAndParseFile(corpusDir + config.corpus);      
    }

    if (config.corpus == "adi"){
        return readAndParseFile(corpusDir + config.corpus);      
    }
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

function readAndParseFile(path){
    var deferred = q.defer();

    fs.readFile(path, 'utf8', function(err, data) {

        if(err){
            deferred.reject(err);
        }

        var corpus = data.split("\n");
        var docs = new Array();
        var docsCount = -1,section;

        corpus.forEach(function(line){
            var lineString = String(line);

            if (lineString.startsWith(".I")){
                section = 0;
            }

            if (lineString.startsWith(".T")){
                lineString = lineString.substr(2,lineString.length);
                section = 1;
            }

            if (lineString.startsWith(".A")){
                lineString = lineString.substr(2,lineString.length);
                section = 2;
            }

            if (lineString.startsWith(".W")){
                lineString = lineString.substr(2,lineString.length);
                section = 3;
            }
  
            if (lineString.startsWith(".B")){
                section = 4;
            }

            if (section == 0){
                var docID = lineString.substring(3,lineString.length);
                var doc = new Object();
                doc.id = docID;
                doc.title = "";
                doc.text  = "";
                doc.auther = "";
                docs.push(doc);
                docsCount++;
            }

            if (section == 1){
                docs[docsCount].title = docs[docsCount].title + lineString;
            }

            if (section == 2){
                docs[docsCount].auther = docs[docsCount].auther + lineString;
            }

            if (section == 3){
                docs[docsCount].text = docs[docsCount].text + lineString;
            }
        });

        deferred.resolve(docs);
    });
    return deferred.promise;
}
