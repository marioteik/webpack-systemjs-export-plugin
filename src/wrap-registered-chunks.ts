import { camelcase as toCamelCase } from 'varname';
import { ConcatSource } from 'webpack-sources';
import * as path from 'path';
import * as fs from 'fs';
import { WebpackCompiler } from './webpack-systemjs-export-plugin';


/**
 *  Wrap registered chunks with `SystemJS.register`
 *  A fork of Joel Denning's Plugin.
 */
export function wrapRegisteredChunks(registry: { name: string, alias: (chunk: string) => string }[] = [], compiler: WebpackCompiler) {

  var externalModuleFiles = [];
  var externalModules = [];

  if (!compiler.options.resolve) {
    compiler.options.resolve = {}
  }

  if (!compiler.options.resolve.alias) {
    compiler.options.resolve.alias = {};
  }

  compiler.plugin('normal-module-factory', nmf => {
    nmf.plugin('before-resolve', (result, callback) => {
      if (!result) {
        return callback();
      }

      if (options.systemjsDeps.find(dep => dep.test(result.request))) {
        const filename = `node_modules/__${toJsVarName(result.request)}`;
        if (externalModuleFiles.indexOf(filename) < 0) {
          externalModuleFiles.push(filename)
          fs.writeFile(filename, `module.exports = ${toJsVarName(result.request)};`, err => {
            if (err) {
              console.error(err);
              throw err;
            }

            externalModules.push({
              depFullPath: result.request,
              depVarName: toJsVarName(result.request),
            });
            result.request = path.resolve(process.cwd(), filename);

            callback(null, result);
          });
        } else {
          result.request = path.resolve(process.cwd(), filename);
          callback(null, result);
        }
      } else {
        callback(null, result)
      }
    });

    nmf.plugin('after-resolve', (result, callback) => {
      if (!result) {
        return callback();
      }

      if (options.systemjsDeps.find(dep => dep.test(result.request))) {
        result.resource = path.resolve(process.cwd(), `__${toJsVarName(result.request)}`);
      }

      callback(null, result);
    });
  });

  compiler.plugin("compilation", compilation => {

    // Can't override the __webpack_require__.p via plugin because of https://github.com/webpack/webpack/blob/1b459d91f56215a3c617373d456ad53f9a63fea3/lib/MainTemplate.js#L99
    if (options.publicPath.useSystemJSLocateDir) {
      compilation.mainTemplate.plugin('require-extensions', (source, chunk, hash) => source.replace(/__webpack_require__\.p = \".*\";/, '__webpack_require__.p = $__wsr__public__path;'));
    }

    // http://stackoverflow.com/questions/35092183/webpack-plugin-how-can-i-modify-and-re-parse-a-module-after-compilation
    compilation.plugin('seal', () => {
      compilation.modules.forEach(m => {
        let isEntry = m.entry;
        const entries = (compiler.options.entry || {});
        for (const entryName in entries) {
          isEntry = m.rawRequest.trim() === entries[entryName].trim();
        }
        if (isEntry && m._source) {
          m._source._value += `\n$__register__main__exports(exports);`;
        }
      });
    });

    // Based on https://github.com/webpack/webpack/blob/ded70aef28af38d1deb2ac8ce1d4c7550779963f/lib/WebpackSystemRegister.js
    compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
      chunks.forEach(chunk => {
        if (!chunk.initial) {
          return;
        }

        chunk.files.forEach(file => {
          compilation.assets[file] = new ConcatSource(sysRegisterStart(options, externalModules), compilation.assets[file], sysRegisterEnd(options));
        });
      });
      callback();
    });
  });
}

function sysRegisterStart(opts, externalModules) {

  let registerName = () => {
    return opts.registerName ? `'${opts.registerName}', ` : '';
  }

  let depsList = () => {
    return `[${externalModules.map(toDepFullPath).map(toStringLiteral).map(toCommaSeparatedList).reduce(toString, '')}]`;
  }

  let toCommaSeparatedList = (name, i) => {
    return `${i > 0 ? ', ' : ''}${name}`;
  }

  let toSetters = (opts, name, i) => {
    // webpack needs the __esModule flag to know how to do it's interop require default func
    const result = `${i > 0 ? ',' : ''}
      function(m) {
        ${name} = $__wsr__interop(m);
      }`;

    return opts.minify ? minify(result) : result;
  }

  let toStringLiteral = (str) => {
    return `'${str}'`;
  }

  let toString = (prev, next) => {
    return prev + next;
  }

  const result =
    `System.register(${registerName()}${depsList()}, function($__export) {
  ${externalModules.length > 0 ? `var ${externalModules.map(toDepVarName).map(toCommaSeparatedList).reduce(toString, '')};` : ``}
${opts.publicPath.useSystemJSLocateDir
      ? `
  /* potentially the first load is always the one we're interested in??? if so .find should short circuit anyway so no perf probs */
  var $__wsr__load = SystemJS._loader.loads.find(function(load) {
    return load.name === SystemJS.normalizeSync('${opts.registerName}');
  });

  if (!$__wsr__load) {
    throw new Error("webpack-system-register plugin cannot correctly set webpack's publicPath, since there is no current SystemJS load for " + SystemJS.normalizeSync('${opts.registerName}'))
  }

  var $__wsr__public__path = $__wsr__load.address.substring(0, $__wsr__load.address.lastIndexOf('/') + 1);`
      : ``
    }

  function $__register__main__exports(exports) {
    for (var exportName in exports) {
	  $__export(exportName, exports[exportName]);
    }
  }

  function $__wsr__interop(m) {
	return m.__useDefault ? m.default : m;
  }

  return {
    setters: [${externalModules.map(toDepVarName).map(toSetters.bind(null, opts)).reduce(toString, '')}
    ],
    execute: function() {
`;
  return opts.minify ? minify(result) : result;

}

function sysRegisterEnd(opts) {
  const result =
    `
    }
  }
});
`
  return opts.minify ? minify(result) : result;
}

function toJsVarName(systemJsImportName) {
  return toCamelCase(removeSlashes(moduleName(systemJsImportName)));
}

function moduleName(systemJsImportName) {
  return systemJsImportName.includes('!') ? systemJsImportName.slice(0, systemJsImportName.indexOf('!')) : systemJsImportName;
}

function removeSlashes(systemJsImportName) {
  return systemJsImportName.replace('/', '');
}

function toDepVarName(externalModule) {
  return externalModule.depVarName;
}

function toDepFullPath(externalModule) {
  return externalModule.depFullPath;
}

function minify(string) {
  return string.replace(/\n/g, '');
}
