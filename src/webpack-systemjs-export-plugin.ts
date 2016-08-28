import * as path from 'path';
import * as fs from 'fs';
import { ConcatSource } from 'webpack-sources';

/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries, 
 * expose modules, dynamically load chunks with systemjs, etc.
 */
export class WebpackSystemJSExportPlugin {

	private config: Configuration;

	constructor(config: Configuration = {}) {
		this.config = this.validateTypes(config);
	}

	apply = (compiler: WebpackCompiler) => {

		this.clearExternals(this.config.externals, compiler);

		this.exposePublicModules(this.config.public, compiler);

		this.wrapRegisteredChunks(this.config.register, compiler);

		this.bundleSystemJS(this.config.bundleSystemJS, compiler);

	}

  /**
	 * Clear the inner part of modules included in the compiler.externals, 
	 * replace with SystemJS.import('three').then(res => exports = res)
	*/
	clearExternals = (externals: (string | RegExp)[] = [], compiler: WebpackCompiler) => {

	}

  /** 
	 * Expose any public modules to SystemJS. 
	 */
	exposePublicModules = (publicModules: (string | RegExp)[] = [], compiler: WebpackCompiler) => {

	}

	/**
	 *  Wrap registered chunks with `SystemJS.register`
	 */
	wrapRegisteredChunks = (registry: { name: string, alias: (chunk: string) => string }[] = [], compiler: WebpackCompiler) => {

	}

	/**
	 * Bundle SystemJS within a given Chunk as a global dependency.
	 */
	bundleSystemJS = (chunkName: string = '', compiler: WebpackCompiler) => {
		if (!chunkName) return;

		compiler.plugin('compilation', (compilation) => {

			compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
				chunks.forEach(chunk => {

					if (!(chunk.isInitial() && (chunk.name === chunkName))) {
						return;
					}

					let file = chunk.files[0];
					let production = '.src';

					// Use the production version of system.js if you're in production mode.
					if (process.env['NODE_ENV']) {
						if (process.env['NODE_ENV'].match(/production/))
							production = '-csp-production';
					}

					let pathToSystemJS = path.join(
						__dirname,
						'node_modules',
						'systemjs',
						'dist',
						`system${production}.js`);

					let systemjsString = fs.readFileSync(pathToSystemJS).toString();
					
					compilation.assets[file] = new ConcatSource(compilation.assets[file], systemjsString);
				});
				callback();
			});

		});
	}

	/**
	 * Validate the Types of the constructor config at runtime.
	 */
	validateTypes = (config) => {
		
		let err = (e) => { throw new Error('WebpackSystemJSExport Error: ' + e) };

		let checkIfArrayOfType = (obj, eTypeCheck: (t) => boolean, varname: string, typename: string) => {
			if (typeof obj !== 'undefined') {
				if (!Array.isArray(obj))
					err(`configuration \`${varname}\` must be of type ${typename}`);

				for (var element of obj)
					if (!eTypeCheck(element))
						err(`configuration \`${varname}\` must be of type ${typename} on every element of array`);
			}
		}

		// Check every possible configuration parameter.

		if (typeof config !== 'object')
			err('Configuration must be of type Object');

		// externals
		checkIfArrayOfType(
			config.externals,
			(type) => typeof type === 'string' || type instanceof RegExp,
			'externals',
			'(string | RegExp)[]'
		);

		// public
		checkIfArrayOfType(
			config.public,
			(type) => typeof type === 'string' || type instanceof RegExp,
			'public',
			'(string | RegExp)[]'
		);

		// register
		checkIfArrayOfType(
			config.register,
			(type) => typeof type.name === 'string' && typeof type.alias === 'function',
			'register',
			'{name: string, alaias: (chunk: string) => string}'
		);

		// bundleSystemJS
		if (typeof config.bundleSystemJS !== 'string')
			err('configuration `bundleSystemJS` must be of type string');

		return config;
	}
}

export interface WebpackCompiler {
  outputPath: string,
  options: any,
  plugin: (p:string, cb: (...a) => void) => void,

}

export interface Configuration {

	// Any external modules that will not be bundled by Webpack (defaults to none.)
	externals?: (string | RegExp)[],

	// Any node_modules you wish to expose (defaults to all of them.)
	public?: (string | RegExp)[],

	// Specify which chunks you want to wrap with SystemJS.register (defaults to none.)
	register?: {
		name: string,
		alias: (chunk: string) => string
	}[],

	// Bundles SystemJS as a global dependency to the chunk of your choosing. (defaults to none.)
	bundleSystemJS?: string
}

export default WebpackSystemJSExportPlugin;