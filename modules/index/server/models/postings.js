'use strict';

module.exports = function(sequelize, DataTypes){
    var PostingsList = sequelize.define('Posting', {
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