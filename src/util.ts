export async function getTemplate() {
  const res = await fetch(
    new URL("ts-guard.tpl.ts", import.meta.url),
  );
  return await res.text();
}
