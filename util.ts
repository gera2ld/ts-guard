export async function readTemplate(file: string) {
  const res = await fetch(
    new URL(file, import.meta.url),
  );
  return await res.text();
}
