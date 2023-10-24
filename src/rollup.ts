import { dirname, resolve, relative } from 'node:path';
import { ProjectOptions } from 'ts-morph';
import { ITsGuardBuildOptions, compile } from './ts-guard';

function normalizeId(rootDir: string, id: string) {
  const relpath = relative(rootDir, id).replace(/\.ts$/, '.js');
  if (!relpath.startsWith('../')) {
    return relpath;
  }
  return '';
}

export function tsGuardRollup(
  buildOptions: ITsGuardBuildOptions,
  projectOptions?: ProjectOptions,
) {
  const rootDir = resolve(buildOptions.rootDir);
  const files = compile(buildOptions, projectOptions);
  return {
    name: 'ts-guard-rollup',
    resolveId: (importee: string, importer?: string) => {
      const id = importer ? resolve(dirname(importer), importee) : importee;
      const relpath = normalizeId(rootDir, id);
      if (files[relpath]) {
        return id;
      }
    },
    load: (id: string) => {
      const relpath = normalizeId(rootDir, id);
      const content = files[relpath];
      return content;
    },
  };
}
