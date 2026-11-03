import assert from "node:assert/strict";
import test from "node:test";
import { parseGoodreadsProfile } from "./goodreads";

test("parses the currently-reading book from Goodreads profile metadata", () => {
  const html = `<meta content='Delroy has 134 books and is currently reading All About Love: New Visions by bell hooks' name='description'>`;

  assert.deepEqual(parseGoodreadsProfile(html), {
    title: "All About Love: New Visions",
    author: "bell hooks",
  });
});

test("decodes HTML entities in Goodreads book metadata", () => {
  const html = `<meta name="description" content="Currently reading The Artist &amp; the Author by A&#39;Smith">`;

  assert.deepEqual(parseGoodreadsProfile(html), {
    title: "The Artist & the Author",
    author: "A'Smith",
  });
});

test("returns null when the public Goodreads profile has no current book", () => {
  const html = `<meta name="description" content="Delroy Wright has 134 books on Goodreads">`;

  assert.equal(parseGoodreadsProfile(html), null);
});

test("returns undefined when Goodreads profile metadata is missing", () => {
  assert.equal(parseGoodreadsProfile("<html></html>"), undefined);
});
