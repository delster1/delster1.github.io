import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { defaultWallpaperId, wallpapers } from "../../../data/wallpapers";
import { isSameOriginRequest } from "../../../lib/admin-auth";
import {
  getDefaultWallpaperId,
  isWallpaperChoice,
  saveDefaultWallpaperId,
} from "../../../lib/site-settings";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const wallpaperId = await getDefaultWallpaperId(env);
    const wallpaperName =
      wallpaperId === "no-image"
        ? "No image"
        : wallpapers.find((wallpaper) => wallpaper.id === wallpaperId)?.name ?? "Site default";

    return new Response(JSON.stringify({ wallpaperId, wallpaperName }), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to load the saved site default wallpaper; serving the bundled default.", error);
    const wallpaperName =
      wallpapers.find((wallpaper) => wallpaper.id === defaultWallpaperId)?.name ?? "Site default";
    return new Response(JSON.stringify({ wallpaperId: defaultWallpaperId, wallpaperName }), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.isAdmin) return new Response("Unauthorized", { status: 401 });
  if (!isSameOriginRequest(request)) return new Response("Forbidden", { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form submission.", { status: 400 });
  }

  const wallpaperId = formData.get("wallpaperId");
  if (typeof wallpaperId !== "string" || !isWallpaperChoice(wallpaperId)) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard?error=invalid" },
    });
  }

  try {
    await saveDefaultWallpaperId(env, wallpaperId);
  } catch (error) {
    console.error("Failed to save the site default wallpaper.", error);
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard?error=save-failed" },
    });
  }

  return new Response(null, {
    status: 303,
    headers: { Location: "/dashboard?updated=1" },
  });
};
