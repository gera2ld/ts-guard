import { cac } from 'cac';
import { compile, writeFiles } from './ts-guard';

const cli = cac('ts-guard');
cli
  .command('<rootDir>', 'Compile a folder')
  .option('-p, --project', 'Specify the path of tsconfig', {
    default: 'tsconfig.json',
  })
  .option('--guardFile <filepath>', 'Specify the path of guard data, `<rootDir>/_ts_guard.ts` by default')
  .option('--outDir <outDir>', 'The directory to write the emitted files, use the same directory by default')
  .action(async (rootDir: string, options) => {
    const files = await compile({
      rootDir,
      guardFile: options.guardFile,
    }, {
      tsConfigFilePath: options.project,
    });
    await writeFiles(files, options.outDir || rootDir);
  });

cli.help();
cli.parse();
