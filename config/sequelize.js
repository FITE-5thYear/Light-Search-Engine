
var Sequelize = require('Sequelize'),
    winston = require('./winston'),
    config = require('./config'),
    path = require('path'),
    _ = require('lodash'),
    db = {},
    util = require('util'),
    fs = require('fs');

var models = module.exports = { 
    Sequelize : Sequelize,
    init : init
}


function init(callback){

    winston.info('Initializing Sequelize...');

    var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
        host : config.db.host,
        port : config.db.port,
        dialect : config.db.dialect,
        logging : config.db.enableLogging ? winston.verbose : false
    });

    config.getDirectories(config.rootPath + '/modules').forEach(function(pack){
      var pt = config.rootPath + '/modules/' + pack + '/server/models';
        if(fs.existsSync(pt)){
              readdirSync(pt);
        }
    });

    // invoke freaking associations
    Object.keys(db).forEach(function(modelName) {
        if (db[modelName].options.hasOwnProperty('associate')) {
            db[modelName].options.associate(db);
        }
    });

    //sync
    sequelize
    .sync({force: false})
    .then(function(){          
          models.sequelize = sequelize;
          _.extend(models,db);
          callback(models);
      }).catch(function(err){
          winston.error('An error occured: %j',err);
          winston.error(util.inspect(err));
      });

    //function of creating models
    function readdirSync(route){
        fs.readdirSync(route)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== 'index.js');
        })
        // import model files and save model names
        .forEach(function(file) {        
            winston.info('Loading model: ' + file);
            var model = sequelize.import(path.join(route, file));
            db[model.name] = model;
        });
  }
}

