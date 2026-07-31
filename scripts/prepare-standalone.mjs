import { access, cp, mkdir } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const standaloneRoot = new URL("../.next/standalone/", import.meta.url);

await mkdir(new URL(".next/", standaloneRoot), { recursive: true });
await cp(
  new URL(".next/static/", projectRoot),
  new URL(".next/static/", standaloneRoot),
  { recursive: true, force: true },
);

const publicDirectory = new URL("public/", projectRoot);
try {
  await access(publicDirectory);
  await cp(publicDirectory, new URL("public/", standaloneRoot), {
    recursive: true,
    force: true,
  });
} catch {
  // Public assets are optional.
}
