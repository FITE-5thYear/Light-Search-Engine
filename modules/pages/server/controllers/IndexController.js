'use strict';

var path = require('path');

module.exports.renderIndex = function(req, res){
    res.sendFile(path.resolve(__dirname + '//..//views//index.html'));
}

module.exports.search = function(req, res){
    console.log(req.query);
    return res.redirect('/');
}