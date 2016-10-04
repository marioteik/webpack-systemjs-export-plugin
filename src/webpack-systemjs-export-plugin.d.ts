/**
 * Fully integrate Webpack with SystemJS, export systemjs libraries,
 * expose modules, dynamically load chunks with systemjs, etc.
 */
export declare class WebpackSystemJSExportPlugin {
    private config;
    constructor(config?: Configuration);
    apply(compiler: WebpackCompiler): void;
    /**
     * Validate the Types of the constructor config at runtime.
     */
    validateConfigTypes: (config: any) => any;
}
export interface WebpackCompiler {
    outputPath: string;
    options: any;
    plugin: (p: string, cb: (...a) => void) => void;
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
