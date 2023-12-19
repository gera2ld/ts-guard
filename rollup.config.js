import { readFile } from 'fs/promises';
import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };

const external = (id) =>
  /^(?:node:|@babel\/runtime\/|\.\/)/.test(id) ||
  Object.keys(pkg.dependencies).some(
    (dep) => id === dep || id.startsWith(`${dep}/`),
  );
const plugins = [
  babel({
    babelHelpers: 'runtime',
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: false,
          version: '^7.5.0',
        },
      ],
    ],
    exclude: 'node_modules/**',
    extensions: ['.ts'],
  }),
  replace({
    'process.env.TS_GUARD_TEMPLATE': JSON.stringify(
      await readFile('src/ts-guard.tpl.ts', 'utf8'),
    ),
  }),
  {
    name: 'fix-extension',
    generateBundle(options, bundle) {
      Object.keys(bundle).forEach(key => {
        const value = bundle[key];
        if (value.type !== 'chunk') return;
        value.code = value.code.replace(
          /(['"])(.\/[^.]+?)\1/g,
          (_, q, g) => `${q}${g}.${options.format === 'cjs' ? 'cjs' : 'js'}${q}`,
        );
      });
    },
  },
];

export default defineConfig({
  input: {
    cli: './src/cli.ts',
    rollup: './src/rollup.ts',
    shim: './src/shim.ts',
    webpack: './src/webpack.ts',
    'ts-guard': './src/ts-guard.ts',
  },
  plugins,
  external,
  output: [{
    format: 'es',
    dir: 'lib',
  }, {
    format: 'cjs',
    dir: 'lib',
    entryFileNames: '[name].cjs',
  }],
});
