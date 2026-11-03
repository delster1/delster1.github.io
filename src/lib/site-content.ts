import type { GoodreadsReadingStatus } from "./goodreads";

type SiteContent = {
  now: string;
  quotes: string;
  goodreads: GoodreadsReadingStatus;
};

declare const __SITE_CONTENT__: SiteContent;

export const siteContent = __SITE_CONTENT__;
