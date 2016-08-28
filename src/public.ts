import { sep } from 'path';
import * as appRoot from 'app-root-path';

/**
 * Guy Bedford's Plugin:
 * Handles Exposing webpack modules by their name.
 */
export default class SystemJSRegisterPublicModules {

  private registerModules;
  private bundlesConfigForChunks;
  private outputOptions;

  constructor(options: { bundlesConfigForChunks?: boolean, registerModules?: Object } = {}) {
    // default is public modules
    this.registerModules = options.registerModules || [{ filter: 'public' }];

    this.bundlesConfigForChunks =
      typeof options.bundlesConfigForChunks == 'boolean' ? options.bundlesConfigForChunks : true;
  }

  private getModuleLoaderManifest(modules, entryChunk, outputOptions, hash) {
    const bundlesConfigForChunks = this.bundlesConfigForChunks;
    const includes = this.registerModules;

    const manifest = {
      registerModules: [],
      esModules: [],
      chunks: []
    };

    const existingKeys = [];

    const path = outputOptions.path;

    // convert module objects into structured module objects for our own use
    let packagejson = require(appRoot.path + '/package.json');

    let moduleObjs = modules.map(m => ({
      id: m.id,
      request: m.rawRequest || '',
      path: m.resource || '',
      relPath: m.resource && m.resource.substr(0, path.length + 1) == path + sep ? m.resource.substr(path.length + 1) : m.resource || '',
      isPackageMain: m.resource === appRoot.path,
      packageName: packagejson.name,
      packageVersion: packagejson.version,
      meta: m.meta
    }));

    // default filters and naming functions
    let publicFilter = (moduleName) => moduleName.request.match(/^@[^\/\\]+\/\\[^\/\\]$|^[^\/\\]+$/);

    let localFilter = (moduleName) => {
      // modules outside of the project root are not considered local anymore
      if (moduleName.path.substr(0, path.length) != path)
        return false;
      return !moduleName.path.substr(path.length).match(/(^|\/|\\)node_modules(\/|\\|$)/);
    }
    let publicModuleName = (moduleName) => {
      return moduleName.request;
    }
    let localModuleName = (moduleName) => {
      return moduleName.relPath;
    }

    // determine includes
    includes.forEach((include, index) => {
      let filter = include.filter;
      let publicKeyFn = include.keyname;

      // public key template function
      // we should really do this with better properties than the normal module entries
      if (typeof publicKeyFn == 'string') {
        const string = publicKeyFn;
        publicKeyFn = (moduleName, existingKeys) => {
          let str = string;
          // allow simple templating
          for (const p in moduleName) {
            if (moduleName.hasOwnProperty(p))
              str = str.replace(`[${p}]`, module[p]);
          }
          return str;
        }
      }

      // default filters
      if (filter == 'all') {
        filter = moduleName => true;
        publicKeyFn = publicKeyFn || ((moduleName, existingKeys) => {
          //if (publicFilter(moduleName))
          //  return publicNames(moduleName);
          //else
          //  return localNames(moduleName);
        });
      }
      else if (filter == 'public') {
        filter = publicFilter;
        publicKeyFn = publicKeyFn || publicModuleName;
      }
      else if (filter == 'local') {
        filter = localFilter;
        publicKeyFn = publicKeyFn || localModuleName;
      }

      if (!publicKeyFn)
        throw new TypeError(`SystemJS register public modules plugin has no keyname function defined for filter ${index}`);

      moduleObjs.filter(m => filter(m, existingKeys)).forEach(m => {
        const publicKey = publicKeyFn(m, existingKeys);
        if (typeof publicKey != 'string')
          throw new TypeError(`SystemJS register public modules plugin did not return a valid key for ${m.path}`);
        if (existingKeys.indexOf(publicKey) != -1) {
          if (manifest.registerModules[m.id] != publicKey)
            throw new TypeError(`SystemJS register public module ${publicKey} is already defined to another module`);
          existingKeys.push(publicKey);
        }
        manifest.registerModules[m.id] = publicKey;

        if (m.meta.harmonyModule)
          manifest.esModules[m.id] = true;
      });
    });

    // build up list of public modules against chunkids
    if (bundlesConfigForChunks) {
      let visitChunks = (chunk, visitor) => {
        visitor(chunk);
        chunk.chunks.forEach(visitor);
      }

      visitChunks(entryChunk, chunk => {
        const publicChunkModuleIds = [];
        chunk.modules.forEach(m => {
          if (manifest.registerModules[m.id])
            publicChunkModuleIds.push(m.id);
        });

        // is it possible for the main entry point to contain multiple chunks? how would we know what these are?
        // or is the main compilation always the first chunk?
        if (publicChunkModuleIds.length && chunk.id != entryChunk.id)
          manifest.chunks[chunk.id] = publicChunkModuleIds;
      });
    }

    return manifest;
  }

  apply(compiler) {
    var self = this;
    compiler.plugin('compilation', function(compilation) {
      const mainTemplate = compilation.mainTemplate;

      mainTemplate.plugin('bootstrap', function(source, chunk, hash) {
        const bundlesConfigForChunks = self.bundlesConfigForChunks;

        const publicModuleLoaderManifest = [];
        const publicModuleChunks = [];

        const manifest = self.getModuleLoaderManifest(compilation.modules, chunk, this.outputOptions, hash);

        let stringifySparseArray = (arr) => {
          return `[${arr.map((value:any) => {
            if (value === undefined)
              return '';
            else if (typeof value == 'boolean')
              return value ? '1' : '0';
            else
              return JSON.stringify(value);
          }).join(',').replace(/,+$/, '')}]`;
        }

        return this.asString([
          `var publicModuleLoaderManifest = ${stringifySparseArray(manifest.registerModules)};`,
          `var publicESModules = ${stringifySparseArray(manifest.esModules)};`,
          (bundlesConfigForChunks ? `var publicModuleChunks = ${stringifySparseArray(manifest.chunks)};` : ""),
          source
        ]);
      });

      mainTemplate.plugin('add-module', function(source) {
        return this.asString([
          source,
          "defineIfPublicSystemJSModule(moduleId);"
        ]);
      });

      mainTemplate.plugin('require-extensions', function(source, chunk, hash) {
        const bundlesConfigForChunks = self.bundlesConfigForChunks;

        const output = [source];

        if (bundlesConfigForChunks) {
          const chunkMaps = chunk.getChunkMaps();
          const chunkFilename = this.outputOptions.chunkFilename;

          output.push("var systemJSBundlesConfig = {};");
          output.push("for (var chunkId in publicModuleChunks) {");
          output.push(this.indent([
            "var moduleIds = publicModuleChunks[chunkId];",
            "var moduleNames = [];",
            "for (var i = 0; i < moduleIds.length; i++)",
            this.indent([
              "moduleNames.push(publicModuleLoaderManifest[moduleIds[i]]);",
            ]),

            `systemJSBundlesConfig[${this.requireFn}.p + ${this.applyPluginsWaterfall("asset-path", JSON.stringify(chunkFilename), {
              hash: "\" + " + this.renderCurrentHashCode(hash) + " + \"",
              hashWithLength: length => "\" + " + this.renderCurrentHashCode(hash, length) + " + \"",
              chunk: {
                id: "\" + chunkId + \"",
                hash: "\" + " + JSON.stringify(chunkMaps.hash) + "[chunkId] + \"",
                hashWithLength(length) {
                  const shortChunkHashMap = {};
                  Object.keys(chunkMaps.hash).forEach(chunkId => {
                    if (typeof chunkMaps.hash[chunkId] === "string")
                      shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
                  });
                  return "\" + " + JSON.stringify(shortChunkHashMap) + "[chunkId] + \"";
                },
                name: "\" + (" + JSON.stringify(chunkMaps.name) + "[chunkId]||chunkId) + \""
              }
            })}] = moduleNames;`
          ]));
          output.push("}");

          // this check could potentially left out to assume SystemJS-only and throw otherwise,
          // but it seems nice to make it optional
          output.push("var hasSystemJS = typeof SystemJS != 'undefined';");

          output.push("if (hasSystemJS)");
          output.push(this.indent(["SystemJS.config({ bundles: systemJSBundlesConfig });"]));
        }

        output.push("function defineIfPublicSystemJSModule(moduleId) {");
        output.push("var publicKey = publicModuleLoaderManifest[moduleId];");
        output.push("if (publicKey && hasSystemJS)");
        output.push(this.indent([
          "if (publicESModules[moduleId])",
          this.indent([
            "SystemJS.register(publicKey, [], function($__export) {",
            // this could be moved into execution scope
            this.indent([
              "$__export(__webpack_require__(moduleId));"
            ]),
            "});"
          ]),
          "else",
          this.indent([
            "SystemJS.registerDynamic(publicKey, [], false, function() {",
            this.indent([
              "return __webpack_require__(moduleId);"
            ]),
            "});"
          ])
        ]));
        output.push("}");
        output.push("for (var moduleId in modules)");
        output.push(this.indent([
          "if (Object.prototype.hasOwnProperty.call(modules, moduleId))",
          this.indent(["defineIfPublicSystemJSModule(moduleId);"])
        ]));

        return this.asString(output);
      });
    });
  }
}