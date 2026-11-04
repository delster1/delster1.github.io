import assert from "node:assert/strict";
import { test } from "node:test";
import { createServiceInventoryFetcher, parseServiceInventory } from "./service-inventory";

const markdown = `# Services
Last verified: 2026-11-04

## Dashboard links
| Group | Service | URL |
|---|---|---|
| AI | Chat | https://chat.example.test |
| AI | API | https://api.example.test |
| Tools | Monitor | http://monitor.example.test |

## Live Docker services
| Container | Role | Exposure | Persistence | State |
|---|---|---|---|---|
| **AI** |
| \`chat\` | Chat interface | Internal | Data | Healthy |
| **Monitoring** |
| \`monitor\` | Monitoring | Internal | Data | Unhealthy |

### Stack details
| Unrelated | Table |
|---|---|
| Not | Inventory |

## Other private notes
Not dashboard content.
`;

test("parses service groups, documented health and safe navigation links", () => {
  const inventory = parseServiceInventory(markdown);
  assert.equal(inventory.verified, "2026-11-04");
  assert.deepEqual(inventory.services, [
    { name: "chat", group: "AI", role: "Chat interface", state: "Healthy" },
    { name: "monitor", group: "Monitoring", role: "Monitoring", state: "Unhealthy" },
  ]);
  assert.deepEqual(inventory.groups.map((group) => [group.title, group.services.length]), [
    ["AI", 2], ["Tools", 1],
  ]);
  assert.equal(inventory.groups[0].services[0].url, "https://chat.example.test/");
});

test("rejects unsafe URLs, credentials and malformed or missing inventory", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "https://user:password@example.test"]) {
    assert.throws(() => parseServiceInventory(markdown.replace("https://chat.example.test", url)), /HTTP\(S\)/);
  }
  assert.throws(() => parseServiceInventory(""), /verification date/);
  assert.throws(() => parseServiceInventory(markdown.replace("## Live Docker services", "## Missing")), /missing/);
  assert.throws(() => parseServiceInventory(markdown.replace("| `chat` | Chat interface | Internal | Data | Healthy |", "| bad | row |")), /Invalid service/);
});

test("fetches only the private inventory and caches it for five minutes", async () => {
  let time = 0;
  const requests: string[] = [];
  const fetchInventory = createServiceInventoryFetcher(async (input, init) => {
    requests.push(String(input));
    assert.ok(new Headers(init?.headers).get("Authorization"));
    return new Response(markdown);
  }, () => time);
  await assert.rejects(() => fetchInventory(" "), /GITHUB_CONTENT_TOKEN/);
  await fetchInventory("test-token");
  await fetchInventory("test-token");
  assert.equal(requests.length, 1);
  assert.ok(requests[0].endsWith("/global/homelab/SERVICES.md?ref=main"));
  time = 300_000;
  await fetchInventory("test-token");
  assert.equal(requests.length, 2);
});

test("reports repository failures and retries rather than caching failures", async () => {
  let requests = 0;
  const fetchInventory = createServiceInventoryFetcher(async () => {
    requests++;
    return requests === 1 ? new Response("", { status: 403 }) : new Response(markdown);
  });
  await assert.rejects(() => fetchInventory("test-token"), /HTTP 403/);
  assert.equal((await fetchInventory("test-token")).services.length, 2);
});
