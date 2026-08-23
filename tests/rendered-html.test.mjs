import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createReactIconSnippet } from "../lib/icons/svg.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
let serverProcess;
let origin;
let serverOutput = "";

test.before(async () => {
  const portProbe = createServer();
  await new Promise((resolve, reject) => {
    portProbe.once("error", reject);
    portProbe.listen(0, "127.0.0.1", resolve);
  });
  const address = portProbe.address();
  const port = address.port;
  await new Promise((resolve, reject) =>
    portProbe.close((error) => (error ? reject(error) : resolve())),
  );

  origin = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, [".next/standalone/server.js"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverProcess.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  serverProcess.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Standalone server exited early:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${origin}/api/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Standalone server did not become ready:\n${serverOutput}`);
});

test.after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill();
  await once(serverProcess, "exit");
});

async function request(path = "/", init) {
  return fetch(`${origin}${path}`, {
    headers: { accept: "text/html", host: "localhost" },
    redirect: "manual",
    ...init,
  });
}

test("redirects the root URL to the icon library", async () => {
  const response = await request("/");
  assert.ok([307, 308].includes(response.status));
  assert.equal(
    new URL(response.headers.get("location"), "http://localhost").pathname,
    "/library",
  );
});

for (const [path, title, content] of [
  ["/library", "图标库", "让图标资产井然有序"],
  ["/explore", "探索图标", "Powered by Iconify"],
  ["/favorites", "我的收藏", "标记为收藏的图标"],
  ["/recent", "最近浏览", "最近打开过的图标"],
  ["/trash", "回收站", "已移除、仍可恢复的图标"],
  ["/collections/%E5%93%81%E7%89%8C%E8%B5%84%E4%BA%A7", "品牌资产", "当前集合"],
]) {
  test(`server-renders ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title} · IconNest</title>`));
    assert.match(html, new RegExp(content));
    assert.match(html, /Icon workspace/);
  });
}

test("exposes a machine-readable health endpoint", async () => {
  const response = await request("/api/health", {
    headers: { accept: "application/json", host: "localhost" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: "IconNest",
    status: "ok",
    version: "0.1.0",
  });
});

test("rejects invalid icon API input before contacting upstream", async () => {
  const [searchResponse, prefixResponse, svgResponse] = await Promise.all([
    request("/api/icons/search?q=a", {
      headers: { accept: "application/json", host: "localhost" },
    }),
    request("/api/icons/search?q=camera&prefix=mdi", {
      headers: { accept: "application/json", host: "localhost" },
    }),
    request("/api/icons/svg?icon=invalid", {
      headers: { accept: "application/json", host: "localhost" },
    }),
  ]);

  assert.equal(searchResponse.status, 400);
  assert.equal(prefixResponse.status, 400);
  assert.equal(svgResponse.status, 400);
  assert.match((await searchResponse.json()).error, /2 到 80/);
  assert.match((await prefixResponse.json()).error, /不支持/);
  assert.match((await svgResponse.json()).error, /无效/);
});

test("creates portable React icon snippets without changing SVG geometry", () => {
  const snippet = createReactIconSnippet(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path class="mark" fill-rule="evenodd" stroke-width="2" d="M0 0h256v256H0z"/></svg>',
    "256 heart",
  );

  assert.match(snippet, /function Icon256HeartIcon\(props\)/);
  assert.match(snippet, /viewBox="0 0 256 256"/);
  assert.match(snippet, /className="mark"/);
  assert.match(snippet, /fillRule="evenodd"/);
  assert.match(snippet, /strokeWidth="2"/);
  assert.match(snippet, /aria-hidden="true" \{\.\.\.props\}/);
  assert.doesNotMatch(snippet, /viewBox="0 0 24 24"/);
});
