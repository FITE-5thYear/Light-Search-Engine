var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    rootPath : rootPath,
    port : process.env.PORT || 3000
}