'use strict';


module.exports.do = function(docs){

}

let pythonBridge = require('python-bridge');

let python = pythonBridge();

python.ex`import math`;
python`math.sqrt(9)`.then(x => console.log(x));

let list = [3, 4, 2, 1];
python`sorted(${list})`.then(x => console.log(x));

python.end();