import { join } from 'node:path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { ProjectOptions } from 'ts-morph';
import { ITsGuardBuildOptions, compile } from './ts-guard';

export class TsGuardPlugin extends VirtualModulesPlugin {
  constructor(
    buildOptions: ITsGuardBuildOptions,
    projectOptions?: ProjectOptions,
  ) {
    const files = compile(buildOptions, projectOptions);
    const filesWithFullPaths = Object.fromEntries(
      Object.entries(files).map(([key, value]) => [
        join(buildOptions.rootDir, key),
        value,
      ]),
    );
    super(filesWithFullPaths);
  }
}
