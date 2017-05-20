'use strict';

module.exports = function(sequelize, DataTypes){
    var Docs = sequelize.define('Docs', {
        id : {
            type : DataTypes.INTEGER,
            primaryKey: true
        },
        length : {
            type : DataTypes.INTEGER
        }
    }, {
        tableName : "docs",
        underscore : true
    });

    return Docs;
}