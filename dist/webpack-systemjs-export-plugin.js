"use strict";
const expose_public_modules_1 = require('./expose-public-modules');
const bundle_systemjs_1 = require('./bundle-systemjs');
const clear_externals_1 = require('./clear-externals');
const wrap_registered_chunks_1 = require('./wrap-registered-chunks');
/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries,
 * expose modules, dynamically load chunks with systemjs, etc.
 */
class WebpackSystemJSExportPlugin {
    constructor(config = {}) {
        /**
         * Validate the Types of the constructor config at runtime.
         */
        this.validateConfigTypes = (config) => {
            let err = (e) => { throw new TypeError('WebpackSystemJSExport: ' + e); };
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
            checkIfArrayOfType(config.register, (type) => typeof type.name === 'string' && typeof type.alias === 'function', 'register', '{name: string, alaias: (chunk: string) => string}');
            // bundleSystemJS
            if (typeof config.bundleSystemJS !== 'undefined')
                if (typeof config.bundleSystemJS !== 'string')
                    err('configuration `bundleSystemJS` must be of type string');
            return config;
        };
        this.config = this.validateConfigTypes(config);
    }
    apply(compiler) {
        // Remove external dependencies from bundle, 
        // and load them from SystemJS instead.
        clear_externals_1.clearExternals(this.config.externals, compiler);
        // Expose any public modules to SystemJS
        expose_public_modules_1.exposePublicModules(this.config.public, compiler);
        // Wrap chunks with System.register to load them dynamically.
        wrap_registered_chunks_1.wrapRegisteredChunks(this.config.register, compiler);
        // Bundle SystemJS in a given chunk.
        bundle_systemjs_1.bundleSystemJS(this.config.bundleSystemJS, compiler);
    }
}
exports.WebpackSystemJSExportPlugin = WebpackSystemJSExportPlugin;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebpackSystemJSExportPlugin;
