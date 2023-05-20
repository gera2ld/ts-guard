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

Free your mind and enjoy promised TypeScript.

## Usage

### Use with Deno

In a TypeScript project, run the following command to compile (consider a
replacement of `tsc`):

```bash
$ deno run -A https://github.com/gera2ld/ts-guard/raw/main/src/main.ts
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

See [fixtures](./fixtures/).
