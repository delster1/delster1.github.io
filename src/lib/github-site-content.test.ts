import assert from "node:assert/strict";
import { test } from "node:test";
import { createGitHubSiteContentFetcher } from "./github-site-content";

test("fetches only the public Now and quote files from the private repository", async () => {
  const requests: { url: string; authorization: string | null }[] = [];
  const fetchContent = createGitHubSiteContentFetcher(async (input, init) => {
    const url = String(input);
    requests.push({
      url,
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return new Response(url.includes("now.md") ? "# Now" : "A quote", { status: 200 });
  });

  const content = await fetchContent("read-only-token");

  assert.deepEqual(content, { now: "# Now", quotes: "A quote" });
  assert.equal(requests.length, 2);
  assert.ok(requests.every(({ authorization }) => authorization === "Bearer read-only-token"));
  assert.ok(requests.some(({ url }) => url.endsWith("/global/public/now.md?ref=main")));
  assert.ok(requests.some(({ url }) => url.endsWith("/global/quotes.md?ref=main")));
});

test("caches successful content for five minutes", async () => {
  let currentTime = 0;
  let requestCount = 0;
  const fetchContent = createGitHubSiteContentFetcher(
    async () => {
      requestCount += 1;
      return new Response("public content", { status: 200 });
    },
    () => currentTime
  );

  await fetchContent("read-only-token");
  await fetchContent("read-only-token");
  assert.equal(requestCount, 2);

  currentTime = 5 * 60 * 1000;
  await fetchContent("read-only-token");
  assert.equal(requestCount, 4);
});

test("reports missing credentials and GitHub errors", async () => {
  const fetchContent = createGitHubSiteContentFetcher(async () =>
    new Response("not found", { status: 404 })
  );

  await assert.rejects(() => fetchContent(" "), /GITHUB_CONTENT_TOKEN is not configured/);
  await assert.rejects(() => fetchContent("read-only-token"), /GitHub returned HTTP 404/);
});
