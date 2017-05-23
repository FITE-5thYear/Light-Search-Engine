'use strict';

var fs = require('fs'),
    HashMap = require('hashmap'),
    winston = require('../config/winston'),
    q = require('q'),
    corpus = require('./../config/env').corpus;

module.exports.queriesHashMap = queriesHashMap;
module.exports.relevanceHashMap = revelanceHashMap;


var queriesHashMap, revelanceHashMap;

module.exports.getEvalData = function(){
    var corpusDir = __dirname + '/../corpus/';
    if (corpus == "CRAN" || corpus == "ADI"){
        winston.info('Read quries file');
        var quriesFileData      = fs.readFileSync(corpusDir + corpus + '/' + corpus +".QRY",'utf-8');
        winston.info('Read relevance file');
        var relevanceFileData   = fs.readFileSync(corpusDir + corpus + '/' + corpus +".REL",'utf-8');
        var quriesHashMap = readAndParseQueriesFile(quriesFileData);
        quriesHashMap = readAndParseRelevanceFile(relevanceFileData,quriesHashMap);
        module.exports.quriesHashMap = quriesHashMap;
    }else if(corpus == "TIME"){
        var queriesFilePath = corpusDir + corpus + '/' + corpus +".QUE",
            revelanceFilePath = corpusDir + corpus + '/' + corpus +".REL";


        winston.info('Reading queries file : ' + queriesFilePath);
        var queriesFileData = fs.readFileSync(queriesFilePath,'utf-8');

        winston.info('Reading relevance file : ' + revelanceFilePath);
        var relevanceFileData   = fs.readFileSync(revelanceFilePath,'utf-8');
        
        queriesHashMap = parseTIMEQueries(queriesFileData);
        revelanceHashMap = parseTIMERevelance(relevanceFileData);

        return { queries : queriesHashMap, revelances : revelanceHashMap };
    }    
    else{
        winston.error("No evaluation for corpus with name " + corpus);
    } 
}


function readAndParseQueriesFile(data){
    var queriesFile = data.split(/\r?\n/);
    var queries = new Array();      
    var queriesCount = -1,section;

    queriesFile.forEach(function(line){
        var lineString = String(line);

        if (lineString.startsWith(".I")){
            section = 0;
        }

        if (lineString.startsWith(".W")){
            lineString = lineString.substr(2,lineString.length);
            section = 1;
        }

        if (section == 0){
            var queryID = Number(lineString.substring(3,lineString.length));
            var query = new Object();
            query.id = queryID;
            query.text  = "";
            query.relevanceDocs = new Array();
            queries.push(query);
            queriesCount++;
        }

        if (section == 1){
            queries[queriesCount].text = queries[queriesCount].text + " " + lineString;
        }
    });
    var quriesHashMap = new HashMap();
    queries.forEach(function(query){
        query.text = query.text.substring(0,query.text.length -2);
        query.text = query.text.trim();
        quriesHashMap.set(Number(query.id),query);
    });
    return quriesHashMap;
}


function readAndParseRelevanceFile(data,quriesHashMap){
    var relevanceFile = data.split(/\r?\n/);
    relevanceFile.forEach(function(line){
        var lineString = String(line);
        var tokens = lineString.split(' ');
        var query = quriesHashMap.get(Number(tokens[0]));
        if (query != null){
            query.relevanceDocs.push(Number(tokens[1]));
            quriesHashMap.set(query.id,query);
        }
    });
    return quriesHashMap;
}

function parseTIMEQueries(data){
    var lines = data.split(/\r?\n/),
        queryStrings = [];

    lines.forEach(function(line){
        if(!line.startsWith('*')){
            queryStrings.push(line);
        }
    });

    return queryStrings.filter( line => line != "");
}

function parseTIMERevelance(data){
    var lines = data.split(/\r?\n/),
        lines = lines.filter( line => line != ""),
        revelances = [];

    lines.forEach(function(line){
        var lineData = line.split(/\s/g);

        lineData = lineData.filter(_line => _line != "");

        revelances.push({
            queryNumber :  lineData.slice(0,1)[0],
            documents : lineData.slice(1, lines.length)
        });
    });
    
    return revelances;
}

