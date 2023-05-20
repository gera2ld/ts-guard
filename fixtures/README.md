# Demo for ts-guard

Assuming we get an empty object from backend or somewhere out of our control.
But it is supposed to be with a type of `IData`.

By wrapping it with `tsGuard(...)` and compiling with `ts-guard`, the output of
the script above will be `{ strings: [], obj: {} }` instead of an empty object
`{}`.

So we can call array functions on `data.strings` or read `data.obj.tada` without
checking the existence of `data.strings` and `data.obj`.