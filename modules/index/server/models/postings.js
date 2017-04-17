'use strict';

module.exports = function(sequelize, DataTypes){
    var PostingsList = sequelize.define('PostingsList', {
        term : {
            type : DataTypes.STRING
        },
        postings : {
            type : DataTypes.JSON
        }
    }, {
        tableName : "postings_list",
        underscore : true
    });

    return PostingsList;
}