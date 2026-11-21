import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

test("the timing service worker never serves or retains WordPress pilot responses", async () => {
  let activate!: (event: { waitUntil: (promise: Promise<unknown>) => void }) => void;
  let fetchPilot!: (event: { request: { method: string; url: string }; respondWith: () => void }) => void;
  const origin = "https://11run.com.br";
  const deleted: string[] = [];
  const shell = { url: origin + "/manifest.webmanifest" };
  const pilot = { url: origin + "/global/wp-admin/" };

  runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    URL,
    caches: {
      keys: async () => ["11run-timing-v2", "unrelated-app"],
      delete: async () => assert.fail("The worker must not delete other apps' caches"),
      open: async () => ({
        keys: async () => [pilot, shell],
        delete: async (request: { url: string }) => deleted.push(request.url),
      }),
    },
    self: {
      location: { origin },
      clients: { claim: () => undefined },
      addEventListener: (name: string, handler: unknown) => {
        if (name === "activate") activate = handler as typeof activate;
        if (name === "fetch") fetchPilot = handler as typeof fetchPilot;
      },
    },
  });

  await new Promise<void>((resolve, reject) => {
    activate({ waitUntil: (promise) => promise.then(() => resolve(), reject) });
  });
  assert.deepEqual(deleted, [pilot.url]);

  for (const path of ["/global", "/global/", "/global/wp-admin/", "/global/wp-content/photo.webp"]) {
    fetchPilot({
      request: { method: "GET", url: origin + path },
      respondWith: () => assert.fail(`The pilot path must bypass the worker: ${path}`),
    });
  }
});
