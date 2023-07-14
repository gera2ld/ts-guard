import { cac } from 'cac';
import { compile, writeFiles } from './ts-guard';

const cli = cac('ts-guard');
cli
  .command('<rootDir>', 'Compile a folder')
  .option('-p, --project', 'Specify the path of tsconfig', {
    default: 'tsconfig.json',
  })
  .option(
    '-g, --guardFile <filepath>',
    'Specify the path of guard data, `<rootDir>/_ts_guard.ts` by default',
  )
  .option(
    '-o, --outDir <outDir>',
    'The directory to write the emitted files, use the same directory by default',
  )
  .option('-s, --silent', 'Silent mode')
  .action(async (rootDir: string, options) => {
    const files = compile(
      {
        rootDir,
        guardFile: options.guardFile,
      },
      {
        tsConfigFilePath: options.project,
      },
    );
    const outDir = options.outDir || rootDir;
    await writeFiles(files, outDir, {
      onWriteFile(relpath) {
        if (options.silent) {
          return;
        }
        console.log(`File written: <root>/${relpath}`);
      },
    });
  });

cli.parse();
