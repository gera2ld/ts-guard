import { readFile } from 'fs/promises';
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };

const external = (id) =>
  id.startsWith('@babel/runtime/') ||
  id.startsWith('./') ||
  Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).some(
    (dep) => id === dep || id.startsWith(`${dep}/`),
  );
const getPlugins = async () => [
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
    transform(code) {
      return code.replace(
        /(['"])(.\/[^.]+?)\1/g,
        (_, q, g) => `${q}${g}.js${q}`,
      );
    },
  },
];

export default async () => {
  const plugins = await getPlugins();
  return ['ts-guard', 'main', 'rollup', 'shim'].flatMap((basename) => [
    {
      input: `./src/${basename}.ts`,
      plugins,
      external,
      output: {
        format: 'es',
        file: `./lib/${basename}.js`,
      },
    },
    {
      input: `./src/${basename}.ts`,
      plugins,
      external,
      output: {
        format: 'cjs',
        file: `./lib/${basename}.cjs`,
      },
    },
  ]);
};