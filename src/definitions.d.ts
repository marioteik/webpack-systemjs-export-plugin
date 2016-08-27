declare interface WebpackCompiler {
  outputPath: string,
  options: any,
  plugin: (p:string, cb: (...a) => void) => void
}
