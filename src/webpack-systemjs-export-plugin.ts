import * as path from 'path';
import * as fs from 'fs';
import { ConcatSource } from 'webpack-sources';
import { camelcase as toCamelCase } from 'varname';

/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries, 
 * expose modules, dynamically load chunks with systemjs, etc.
 */
export class WebpackSystemJSExportPlugin {

	private config: Configuration;

	constructor(config: Configuration = {}) {
		this.config = this.validateTypes(config);
	}

	apply(compiler) {

	}

	// Validate the Types of a given config at runtime.
	validateTypes(config) {

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
			(type) => typeof type.name === 'number' && typeof type.alias === 'function',
			'register',
			'{name: string, alaias: (chunk: string) => string}'
		);

		// bundleSystemJS
		if (typeof config.bundleSystemJS !== 'string')
			err('configuration `bundleSystemJS` must be of type string');

		return config;
	}
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