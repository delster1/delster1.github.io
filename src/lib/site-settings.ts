import { Client } from "pg";
import { defaultWallpaperId, wallpapers } from "../data/wallpapers";

const defaultWallpaperKey = "default_wallpaper_id";
const noImageChoice = "no-image";

type RuntimeEnv = App.Environment;

function getConnectionString(environment: RuntimeEnv) {
  const connectionString =
    environment.SITE_SETTINGS_DB?.connectionString || environment.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Settings database connection missing. Configure SITE_SETTINGS_DB or DATABASE_URL."
    );
  }

  return connectionString;
}

async function withClient<T>(
  environment: RuntimeEnv,
  operation: (client: Client) => Promise<T>
) {
  const client = new Client({
    connectionString: getConnectionString(environment),
    connectionTimeoutMillis: 10_000,
  });
  await client.connect();
  try {
    return await operation(client);
  } finally {
    await client.end();
  }
}

export function isWallpaperChoice(value: string): boolean {
  return value === noImageChoice || wallpapers.some((wallpaper) => wallpaper.id === value);
}

export async function getDefaultWallpaperId(environment: RuntimeEnv) {
  const configuredId = await withClient(environment, async (client) => {
    const result = await client.query<{ value: string }>(
      'SELECT "value" FROM "site_settings" WHERE "key" = $1 LIMIT 1',
      [defaultWallpaperKey]
    );
    return result.rows[0]?.value;
  });

  if (!configuredId) return defaultWallpaperId;
  if (isWallpaperChoice(configuredId)) return configuredId;

  console.error("Ignoring unknown default wallpaper setting.");
  return defaultWallpaperId;
}

export async function saveDefaultWallpaperId(environment: RuntimeEnv, wallpaperId: string) {
  if (!isWallpaperChoice(wallpaperId)) {
    throw new Error("Unsupported wallpaper choice.");
  }

  await withClient(environment, (client) =>
    client.query(
      `INSERT INTO "site_settings" ("key", "value", "updated_at")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("key") DO UPDATE
       SET "value" = EXCLUDED."value", "updated_at" = NOW()`,
      [defaultWallpaperKey, wallpaperId]
    )
  );
}
