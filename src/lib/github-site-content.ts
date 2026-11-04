export type GitHubSiteContent = {
  now: string;
  quotes: string;
};

const CONTENT_FILES = {
  now: "global/public/now.md",
  quotes: "global/quotes.md",
} as const;
const CONTENT_API_BASE =
  "https://api.github.com/repos/delster1/obsidianNotes/contents";
const REF = "main";
const CACHE_DURATION_MS = 5 * 60 * 1000;

async function fetchFile(
  path: string,
  token: string,
  fetcher: typeof fetch
): Promise<string> {
  const url = `${CONTENT_API_BASE}/${path.split("/").map(encodeURIComponent).join("/")}?ref=${REF}`;
  const response = await fetcher(url, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned HTTP ${response.status} for ${path}.`);
  }

  return response.text();
}

export function createGitHubSiteContentFetcher(
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now
): (token: string) => Promise<GitHubSiteContent> {
  let cached:
    | { content: GitHubSiteContent; expiresAt: number }
    | undefined;
  let inFlight: Promise<GitHubSiteContent> | undefined;

  return async (token) => {
    if (!token.trim()) throw new Error("GITHUB_CONTENT_TOKEN is not configured.");
    if (cached && cached.expiresAt > now()) return cached.content;
    if (inFlight) return inFlight;

    inFlight = Promise.all([
      fetchFile(CONTENT_FILES.now, token, fetcher),
      fetchFile(CONTENT_FILES.quotes, token, fetcher),
    ])
      .then(([nowContent, quotesContent]) => {
        const content = { now: nowContent, quotes: quotesContent };
        cached = { content, expiresAt: now() + CACHE_DURATION_MS };
        return content;
      })
      .finally(() => {
        inFlight = undefined;
      });

    return inFlight;
  };
}

export const fetchGitHubSiteContent = createGitHubSiteContentFetcher();
