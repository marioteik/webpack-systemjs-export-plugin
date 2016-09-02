  import {WebpackCompiler} from './webpack-systemjs-export-plugin';

  /**
	 * Clear the inner part of modules included in the compiler.externals, 
	 * replace with SystemJS.import('three').then(res => exports = res)
	*/
	export function clearExternals(externals: (string | RegExp)[] = [], compiler: WebpackCompiler) {

	}