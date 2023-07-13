import { deepEqual } from "assert";
import { tsGuard } from "@gera2ld/ts-guard/shim";

interface IData {
  strings: string[];
  obj: {
    tada: number;
  };
}

const data = tsGuard({} as IData);
deepEqual(data, {
  strings: [],
  obj: {},
});
