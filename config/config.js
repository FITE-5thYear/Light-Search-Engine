'use strict';

var _ = require('lodash'),
    glob = require('glob'),
    path = require('path'),
    fs   = require('fs');

module.exports = _.assign(require('./env.js'));

module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	var _this = this;

	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	var output = [];

	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {

    var files = glob.sync(globPatterns);

    	if (removeRoot) {
    		files = files.map(function(file) {
          if(typeof removeRoot === 'object'){
            removeRoot.forEach(function(remp){
              file = file.replace(remp, '');
            });
            return file;
          }
    			return file.replace(removeRoot, '');
    		});
    	}

    	output = _.union(output, files);

		}
	}

	return output;
};

module.exports.getDirectories = function(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};