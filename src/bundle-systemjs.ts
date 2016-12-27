import * as path from 'path';
import * as fs from 'fs';
import * as appRoot from 'app-root-path';
import { ConcatSource, RawSource } from 'webpack-sources';

import {WebpackCompiler} from './webpack-systemjs-export-plugin';

export function bundleSystemJS(chunkName: string = '', compiler: WebpackCompiler)  {
  if (!chunkName) return;

	let root = appRoot.toString();

		compiler.plugin('compilation', function(compilation) {

			compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
				chunks.forEach(chunk => {

					if (!((chunk.name === chunkName))) {
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
						root,
						'node_modules',
						'systemjs',
						'dist',
						`system${production}.js`);

					let systemjsString = new RawSource(fs.readFileSync(pathToSystemJS).toString()); //don't kill me pls

					if (compilation.assets[file])
						compilation.assets[file] = new ConcatSource(compilation.assets[file], systemjsString);
				});
				callback();
			});

		});
}