'use strict';

module.exports.tickerToString = function(ticker){
    return ticker.parse(ticker.max());
}