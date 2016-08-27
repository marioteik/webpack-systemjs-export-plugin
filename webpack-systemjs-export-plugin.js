(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["webpack-systemjs-export-plugin"] = factory();
	else
		root["webpack-systemjs-export-plugin"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
"use strict";
/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries,
 * expose modules, dynamically load chunks with systemjs, etc.
 */
class WebpackSystemJSExportPlugin {
    constructor(config = {}) {
        this.config = this.validateTypes(config);
    }
    apply(compiler) {
        console.log(compiler);
    }
    // Validate the Types of a given config at runtime.
    validateTypes(config) {
        let err = (e) => { throw new Error('WebpackSystemJSExport Error: ' + e); };
        let checkIfArrayOfType = (obj, eTypeCheck, varname, typename) => {
            if (typeof obj !== 'undefined') {
                if (!Array.isArray(obj))
                    err(`configuration \`${varname}\` must be of type ${typename}`);
                for (var element of obj)
                    if (!eTypeCheck(element))
                        err(`configuration \`${varname}\` must be of type ${typename} on every element of array`);
            }
        };
        // Check every possible configuration parameter.
        if (typeof config !== 'object')
            err('Configuration must be of type Object');
        // externals
        checkIfArrayOfType(config.externals, (type) => typeof type === 'string' || type instanceof RegExp, 'externals', '(string | RegExp)[]');
        // public
        checkIfArrayOfType(config.public, (type) => typeof type === 'string' || type instanceof RegExp, 'public', '(string | RegExp)[]');
        // register
        checkIfArrayOfType(config.register, (type) => typeof type.name === 'number' && typeof type.alias === 'function', 'register', '{name: string, alaias: (chunk: string) => string}');
        // bundleSystemJS
        if (typeof config.bundleSystemJS !== 'string')
            err('configuration `bundleSystemJS` must be of type string');
        return config;
    }
}
exports.WebpackSystemJSExportPlugin = WebpackSystemJSExportPlugin;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebpackSystemJSExportPlugin;


/***/ }
/******/ ])
});
;