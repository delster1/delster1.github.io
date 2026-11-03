import { Pool } from "pg";
import { defaultWallpaperId, wallpapers } from "../data/wallpapers";

const defaultWallpaperKey = "default_wallpaper_id";
const noImageChoice = "no-image";

type RuntimeEnv = App.Locals["runtime"]["env"];

let pool: Pool | undefined;
let poolConnectionString: string | undefined;

function getPool(environment: RuntimeEnv) {
  const connectionString =
    environment.HYPERDRIVE?.connectionString ||
    environment.DATABASE_URL ||
    environment.BETTER_AUTH_DATABASE_URL ||
    environment.AUTH_DB;

  if (!connectionString) {
    throw new Error("Database connection missing for site settings.");
  }

  if (!pool || poolConnectionString !== connectionString) {
    pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
    poolConnectionString = connectionString;
  }

  return pool;
}

export function isWallpaperChoice(value: string): boolean {
  return value === noImageChoice || wallpapers.some((wallpaper) => wallpaper.id === value);
}

export async function getDefaultWallpaperId(environment: RuntimeEnv) {
  const result = await getPool(environment).query<{ value: string }>(
    'SELECT "value" FROM "site_settings" WHERE "key" = $1 LIMIT 1',
    [defaultWallpaperKey]
  );
  const configuredId = result.rows[0]?.value;

  if (!configuredId) return defaultWallpaperId;
  if (isWallpaperChoice(configuredId)) return configuredId;

  console.error("Ignoring unknown default wallpaper setting.");
  return defaultWallpaperId;
}

export async function saveDefaultWallpaperId(environment: RuntimeEnv, wallpaperId: string) {
  if (!isWallpaperChoice(wallpaperId)) {
    throw new Error("Unsupported wallpaper choice.");
  }

  await getPool(environment).query(
    `INSERT INTO "site_settings" ("key", "value", "updated_at")
     VALUES ($1, $2, NOW())
     ON CONFLICT ("key") DO UPDATE
     SET "value" = EXCLUDED."value", "updated_at" = NOW()`,
    [defaultWallpaperKey, wallpaperId]
  );
}
