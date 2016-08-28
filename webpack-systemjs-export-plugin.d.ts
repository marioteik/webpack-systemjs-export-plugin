declare interface WebpackCompiler {
  outputPath: string,
  options: any,
  plugin: (p:string, cb: (...a) => void) => void,

}

/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries,
 * expose modules, dynamically load chunks with systemjs, etc.
 */
export declare class WebpackSystemJSExportPlugin {
    private config;
    constructor(config?: Configuration);
    apply: (compiler: WebpackCompiler) => void;
    /**
       * Clear the inner part of modules included in the compiler.externals,
       * replace with SystemJS.import('three').then(res => exports = res)
      */
    clearExternals: (externals: (string | RegExp)[], compiler: WebpackCompiler) => void;
    /**
       * Expose any public modules to SystemJS.
       */
    exposePublicModules: (publicModules: (string | RegExp)[], compiler: WebpackCompiler) => void;
    /**
     *  Wrap registered chunks with `SystemJS.register`
     */
    wrapRegisteredChunks: (registry: {
        name: string;
        alias: (chunk: string) => string;
    }[], compiler: WebpackCompiler) => void;
    /**
     * Bundle SystemJS within a given Chunk as a global dependency.
     */
    bundleSystemJS: (chunkName: string, compiler: WebpackCompiler) => void;
    /**
     * Validate the Types of a given config at runtime.
     */
    validateTypes: (config: any) => any;
}
export interface Configuration {
    externals?: (string | RegExp)[];
    public?: (string | RegExp)[];
    register?: {
        name: string;
        alias: (chunk: string) => string;
    }[];
    bundleSystemJS?: string;
}
export default WebpackSystemJSExportPlugin;
