'use strict';

var winston = require('winston'),
    logger = new (winston.Logger)();

logger.add(winston.transports.Console, {
    level: 'verbose',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false
});

module.exports = logger;
