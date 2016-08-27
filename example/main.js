const _ = require('lodash');

let out = _.assign({ 'a': 1 }, { 'b': 2 }, { 'c': 3 });

console.log(out);

module.exports = out;