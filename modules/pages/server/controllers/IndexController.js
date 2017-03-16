'use strict';

var path = require('path');

module.exports.renderIndex = function(req, res){
    res.sendFile(path.resolve(__dirname + '//..//views//index.html'));
}