"use strict";
/**
   * Clear the inner part of modules included in the compiler.externals,
   * replace with SystemJS.import('three').then(res => exports = res)
  */
function clearExternals(externals = [], compiler) {
}
exports.clearExternals = clearExternals;
