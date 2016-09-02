import { sep } from 'path';
import * as appRoot from 'app-root-path';
import { WebpackCompiler } from './webpack-systemjs-export-plugin';

/**
 * exposes a set of public modules within a given webpack compiler.
 * A fork of Guy Bedford's plugin.
 */
export function exposePublicModules(publicModules: (string | RegExp)[] = [], compiler: WebpackCompiler) {


  compiler.plugin('compilation', function (compilation) {
    var mainTemplate = compilation.mainTemplate;

    mainTemplate.plugin('bootstrap', function (source: string, chunk, hash) {

      var manifest = getModuleLoaderManifest(compilation.modules, chunk, this.outputOptions, hash, publicModules);

      var stringifySparseArray = (arr) => {
        return `[${arr.map(value => {
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
        `var publicModuleChunks = ${stringifySparseArray(manifest.chunks)};`,
        source
      ]);
    });

    mainTemplate.plugin('add-module', function (source) {
      return this.asString([
        source,
        "defineIfPublicSystemJSModule(moduleId);"
      ]);
    });

    mainTemplate.plugin('require-extensions', function (source, chunk, hash) {

      const output = [source];
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

  })
}

/**
 * Generates a manifest describing modules and chunks.
 */
function getModuleLoaderManifest(modules: { id: string, rawRequest: string, resource: string, meta: any }[], entryChunk: any, webpackOutputOptions: any, hash: string, publicModules: (string | RegExp)[]) {
  // Start with an empty manifest
  let manifest = {
    registerModules: [],
    esModules: [],
    chunks: []
  };

  // convert module objects into structured module objects for our own use
  let outputPath = webpackOutputOptions.path;
  let moduleObjs = modules.map(m => ({
    id: m.id,
    request: m.rawRequest || '',
    path: m.resource || '',
    relPath: m.resource && m.resource.substr(0, outputPath.length + 1) == outputPath + sep ? m.resource.substr(outputPath.length + 1) : m.resource || '',
    meta: m.meta
  }));

  // Filter all modules according to publicModules import.
  if (publicModules.length === 0)
    publicModules = [/(.*)/];

  moduleObjs = moduleObjs.filter(m =>
    publicModules.find((matcher) => {
      if (m.request.match(/\.\.|\:|\\|\.\//)) return false;
      var match = typeof matcher === 'string' ? new RegExp(matcher) : matcher;
      var s = typeof m.request.match(match) !== 'undefined';
      return s;
    })
  );

  // Build manifest
  for (var m of moduleObjs) {
    manifest.registerModules[m.id] = m.request;

    if (m.meta.harmonyModule)
      manifest.esModules[m.id] = true;
  }
  
  return manifest;
}

