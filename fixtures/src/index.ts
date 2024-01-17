import { tsGuard } from '@gera2ld/ts-guard/shim';
import { deepEqual } from 'assert';

interface IData {
  strings: string[];
  obj: {
    tada: number;
  };
}

interface RecursiveType {
  name: string;
  children: RecursiveType[];
}

const data = tsGuard({} as IData);
deepEqual(data, {
  strings: [],
  obj: {},
});
deepEqual(
  tsGuard({
    name: '',
  } as RecursiveType),
  {
    name: '',
    children: [],
  },
);
