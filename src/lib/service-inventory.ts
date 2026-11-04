import { fetchFile } from "./github-site-content";

export type ServiceInventory = {
  verified: string;
  services: { name: string; group: string; role: string; state: string }[];
  groups: { title: string; services: { name: string; url: string }[] }[];
};

function section(markdown: string, title: string): string {
  const heading = `## ${title}`;
  const lines = markdown.split(/\r?\n/);
  const start = lines.indexOf(heading);
  if (start === -1) throw new Error(`Services inventory is missing "${title}".`);
  const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  return lines.slice(start + 1, end === -1 ? undefined : end).join("\n");
}

function rows(markdown: string): string[][] {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.startsWith("|"));
  if (start === -1) return [];
  const end = lines.findIndex((line, index) => index > start && !line.startsWith("|"));
  return lines.slice(start, end === -1 ? undefined : end)
    .filter((line) => !/^\|[- :|]+\|$/.test(line))
    .map((line) => line.slice(1, line.lastIndexOf("|")).split("|")
      .map((cell) => cell.trim().replace(/`|\*\*/g, "")));
}

export function parseServiceInventory(markdown: string): ServiceInventory {
  const verified = markdown.match(/health states rechecked against `docker ps` on\s+(\d{4}-\d{2}-\d{2})/)?.[1]
    ?? markdown.match(/^Last verified: (.+)$/m)?.[1];
  if (!verified) throw new Error("Services inventory has no verification date.");
  const services: ServiceInventory["services"] = [];
  let group = "Services";
  for (const cells of rows(section(markdown, "Live Docker services")).slice(1)) {
    if (cells.length === 1) {
      group = cells[0];
    } else if (cells.length === 5 && cells.every(Boolean)) {
      services.push({ name: cells[0], group, role: cells[1], state: cells[4] });
    } else {
      throw new Error("Invalid service inventory row.");
    }
  }
  const groups: ServiceInventory["groups"] = [];
  for (const cells of rows(section(markdown, "Dashboard links")).slice(1)) {
    if (cells.length !== 3 || !cells.every(Boolean)) throw new Error("Invalid dashboard link row.");
    const [title, name, value] = cells;
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw new Error("Dashboard links must be HTTP(S) URLs without credentials.");
    }
    let target = groups.find((entry) => entry.title === title);
    if (!target) {
      target = { title, services: [] };
      groups.push(target);
    }
    target.services.push({ name, url: url.href });
  }
  if (!services.length || !groups.length) throw new Error("Services inventory is empty.");
  return { verified, services, groups };
}

export function createServiceInventoryFetcher(
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now
): (token: string) => Promise<ServiceInventory> {
  let cached: { value: ServiceInventory; expiresAt: number } | undefined;
  return async (token) => {
    if (!token.trim()) throw new Error("GITHUB_CONTENT_TOKEN is not configured.");
    if (cached && cached.expiresAt > now()) return cached.value;
    const markdown = await fetchFile("global/homelab/SERVICES.md", token, fetcher);
    const value = parseServiceInventory(markdown);
    cached = { value, expiresAt: now() + 5 * 60 * 1000 };
    return value;
  };
}

export const fetchServiceInventory = createServiceInventoryFetcher();
