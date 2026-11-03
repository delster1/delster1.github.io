export type GoodreadsBook = {
  title: string;
  author: string;
};

export type GoodreadsReadingStatus =
  | { kind: "available"; book: GoodreadsBook | null }
  | { kind: "unavailable" };

export const goodreadsProfileUrl: string;
export function parseGoodreadsProfile(html: string): GoodreadsBook | null | undefined;
export function fetchGoodreadsCurrentlyReading(): Promise<GoodreadsReadingStatus>;
