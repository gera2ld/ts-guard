# @gera2ld/ts-guard

Guard your objects in TypeScript to make sure all fields have the expected types.

Example:

```ts
interface ListResponse {
  error: number;
  list: Item[];
}

// BE somehow returns `{ error: 0 }` without `list`
const data: ListResponse = await fetchData(); // -> { error: 0 }

// TS guard makes sure it is as declared
const safeData: ListResponse = tsGuard(data); // -> { error: 0, list: [] }
```

## Installation

```bash
$ pnpm install @gera2ld/ts-guard
```

## Usage

### Code Change

```diff
+ import { tsGuard } from '@gera2ld/ts-guard/shim';

  export function fetchData() {
-   const res = await axios.get<ListResponse>('/api/fetch-data');
+   // Guard the types of res.data
+   const res = tsGuard(await axios.get<ListResponse>('/api/fetch-data'), 'data');
    return res;
  }
```

## Integration with Bundlers

### Rollup

Add a plugin to `rollup.conf.js`:

```js
import { tsGuardRollup } from '@gera2ld/ts-guard/rollup';

export default {
  // ...
  plugins: [
    tsGuardRollup({
      rootDir: 'src',
    }),
    // ...
  ],
};
```

### Webpack

First compile a subfolder with ts-guard in command-line:

```bash
$ npx @gera2ld/ts-guard <root_dir>
```

All `.ts` files within `<root_dir>` will be compiled to `.js` files in the same directory.

Make sure to tell Webpack to resolve to `.js` file if both `.js` and `.ts` exist. This is the default behavior so usually you don't need to do anything.

Then compile the project as usual.

## Why

We cannot guarentee what we get from another service has the structure we expect even if when use TypeScript.

Take the example above, if BE returns `{ error: 0 }` without `list`, our page might break:

```html
<div>Total: {data.list.length}</div>
```

We don't want to check `null` for every field, which is why we use TypeScript. So we use `ts-guard` to ensure this.

## Result

The compiled code looks like this:

```ts
import { $tsGuard$ } from './_ts_guard.js';

export function fetchData() {
  const res = $tsGuard$(
    /* ListResponse */ 1,
    await axios.get('/api/fetch-data'),
    'data',
  );
  return res;
}
```

Even if `/api/fetch-data` returns `{ error: 0 }`, `$tsGuard$` will patch the response into `{ error: 0, list: [] }`.

## Caveat

- Currently only arrays and objects are checked. Other types are ignored to minimize the overhead, but it is possible to support all types.
- If the absence of a field has a different meaning, you should either not pass it to `tsGuard`, or mark the field as _optional_ (`list?: Item[]`).
