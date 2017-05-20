var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    rootPath : rootPath,
    port : process.env.PORT || 3000,
    db : {
        name : 'light_search_engine',
        username : 'root',
        password : '',
        host : 'localhost',
        port : 3306,
        dialect : 'mysql',
        enableLogging : false
    },
    corpus: 'TIME' 
}