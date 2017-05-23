
var env = require('./../config/env'),
    Sequelize = require('Sequelize'),
    sequelize = new Sequelize(env.db.name, env.db.username, env.db.password, {
        host : env.db.host,
        port : env.db.port,
        dialect : env.db.dialect
    });

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

