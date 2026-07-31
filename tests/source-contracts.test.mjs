import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("production Compose remains a hardened single-container profile", async () => {
  const compose = await source("docker-compose.yml");
  assert.match(compose, /^services:\s*\n\s{2}iconnest:/m);
  assert.equal((compose.match(/^\s{2}[a-z][\w-]*:\s*$/gm) ?? []).length, 1);
  assert.match(compose, /127\.0\.0\.1/);
  assert.match(compose, /read_only: true/);
  assert.match(compose, /cap_drop:\s*\n\s+- ALL/);
  assert.match(compose, /\/api\/health/);
});

test("workspace persistence is a clean version-one IndexedDB schema", async () => {
  const [storage, types] = await Promise.all([
    source("lib/icons/storage.ts"),
    source("lib/icons/types.ts"),
  ]);
  assert.match(storage, /indexedDB\.open/);
  assert.match(storage, /iconnest-workspace/);
  assert.match(types, /version: 1/);
});

test("deployment kit documents the stateless browser-data model", async () => {
  const guide = await source("deploy/README.md");
  assert.match(guide, /exactly one application container/);
  assert.match(guide, /has no volume/);
  assert.match(await source("deploy/Caddyfile.example"), /127\.0\.0\.1:3001/);
});
