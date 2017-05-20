'use strict';

module.exports = function(sequelize, DataTypes){
    var DocumentVectors = sequelize.define('DocumentVectors', {
        docId : {
            type : DataTypes.STRING
        },
        termsVector : {
            type : DataTypes.JSON
        }
    }, {
        tableName : "document_vectors",
        underscore : true
    });

    return DocumentVectors;
}