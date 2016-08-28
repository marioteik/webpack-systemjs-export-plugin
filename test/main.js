const _ = require('lodash');

let o = _.assign({ 'a': 1 }, { 'b': 2 }, { 'c': 3 });

console.log(o);

module.exports = o;