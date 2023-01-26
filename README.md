# ts-guard

Guard your objects in TypeScript to make sure all fields have the expected
types.

## Why

When interacting with backend, we don't always get the promised data structure.
For example, the backend developer promises us that a field will always return a
list, but when it's empty we actually get `null` instead of `[]`, leading to a
page crash. So we can't trust promises, instead we have to check each field to
see if they exist.

By using `ts-guard`, every guarded object will have all the promised fields. So
we can read the properties directly without checking null values everywhere.

## Usage

### Use with Deno

In a TypeScript project, run the following command to compile (consider a
replacement of `tsc`):

```bash
$ deno run -A https://github.com/gera2ld/ts-guard/raw/main/main.ts
```

### Use with Node

Coming soon.

## How It Works

This tool scans the TypeScript files and resolves the types of objects passed to
`tsGuard`. Then it generates a group of rules at compile time. The rules will be
evaluated at runtime and the input object will be manipulated until it fully
satisfies the rules, i.e. it has the promised data structure as in our type
declarations.

Note: only `object` and `array` types are checked for now, since they are the
cause of our page crash most of the time. Other types might be added in the
future.

## Demo

Create a project with a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "es6",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "jsx": "preserve"
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

And a TS file `src/index.ts`:

```ts
interface IData {
  strings: string[];
  obj: {
    tada: number;
  };
}

const data = tsGuard({} as IData);
console.log(data);
```

Assuming we get an empty object from backend or somewhere out of our control.
But it is supposed to be with a type of `IData`.

By wrapping it with `tsGuard(...)` and compiling with `ts-guard`, the output of
the script above will be `{ strings: [], obj: {} }` instead of an empty object
`{}`.

So we can call array functions on `data.strings` or read `obj.tada` without
checking the existence of `data.strings` and `data.obj`.

Free your mind and enjoy promised TypeScript.
