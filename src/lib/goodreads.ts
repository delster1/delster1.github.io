export const goodreadsProfileUrl =
  "https://www.goodreads.com/user/show/134911869-delroy-wright";

export type GoodreadsBook = {
  title: string;
  author: string;
};

export type GoodreadsReadingStatus =
  | { kind: "available"; book: GoodreadsBook | null }
  | { kind: "unavailable" };

export function parseGoodreadsProfile(html: string): GoodreadsBook | null | undefined {
  const descriptionTag = (html.match(/<meta\b[^>]*>/gi) ?? []).find((tag) =>
    readAttribute(tag, "name")?.toLowerCase() === "description"
  );
  const description = descriptionTag && readAttribute(descriptionTag, "content");
  if (!description) return undefined;

  const readingMatch = decodeEntities(description).match(/\b(?:is\s+)?currently reading\s+(.+)$/i);
  if (!readingMatch) return null;

  const reading = readingMatch[1].trim().replace(/[.]\s*$/, "");
  const authorSeparator = reading.lastIndexOf(" by ");
  if (authorSeparator < 1) return { title: reading, author: "" };

  return {
    title: reading.slice(0, authorSeparator).trim(),
    author: reading.slice(authorSeparator + 4).trim(),
  };
}

export async function fetchGoodreadsCurrentlyReading(): Promise<GoodreadsReadingStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(goodreadsProfileUrl, {
      headers: { Accept: "text/html" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Goodreads profile returned HTTP ${response.status}.`);
    }

    const book = parseGoodreadsProfile(await response.text());
    if (book === undefined) {
      throw new Error("Goodreads profile no longer contains its description metadata.");
    }
    return { kind: "available", book };
  } catch (error) {
    console.error("Could not load the currently-reading book from Goodreads.", error);
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

function readAttribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function decodeEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    mdash: "—",
    nbsp: " ",
    ndash: "–",
    quot: '"',
    rdquo: "”",
    rsquo: "’",
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|apos|gt|ldquo|lsquo|lt|mdash|nbsp|ndash|quot|rdquo|rsquo);/gi,
    (entity, value: string) => {
      if (value[0] !== "#") return namedEntities[value.toLowerCase()] ?? entity;

      const codePoint = value[1].toLowerCase() === "x"
        ? Number.parseInt(value.slice(2), 16)
        : Number.parseInt(value.slice(1), 10);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }
  );
}
