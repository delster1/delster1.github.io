import { defaultWallpaperId, wallpapers } from "../data/wallpapers";
import { deriveImagePalette } from "./image-palette";

const preferenceKey = "d3llie.wallpaper.preference";
const siteDefault = "site-default";
const noImage = "no-image";
const fallbackPalette = {
  accent: "hsl(105 42% 76%)",
  accentInk: "#101714",
  panelTint: "rgba(15, 22, 18, 0.94)",
  glow: "rgba(137, 183, 142, 0.2)",
};

let applySequence = 0;
let announcementTimer: number | undefined;

function announce(message: string) {
  const status = document.getElementById("appearance-status");
  if (!status) return;

  status.textContent = message;
  status.hidden = false;
  window.clearTimeout(announcementTimer);
  announcementTimer = window.setTimeout(() => {
    status.hidden = true;
  }, 5000);
}

function setPalette(palette: typeof fallbackPalette) {
  const root = document.documentElement;
  root.style.setProperty("--site-accent", palette.accent);
  root.style.setProperty("--site-accent-ink", palette.accentInk);
  root.style.setProperty("--site-panel-tint", palette.panelTint);
  root.style.setProperty("--site-glow", palette.glow);
}

function isKnownChoice(choice: string) {
  return (
    choice === siteDefault ||
    choice === noImage ||
    wallpapers.some((wallpaper) => wallpaper.id === choice)
  );
}

function readChoice() {
  try {
    const savedChoice = localStorage.getItem(preferenceKey);
    return savedChoice && isKnownChoice(savedChoice) ? savedChoice : siteDefault;
  } catch {
    announce("Browser storage is unavailable; using the site default.");
    return siteDefault;
  }
}

function getWallpaper(choice: string) {
  const id = choice === siteDefault ? defaultWallpaperId : choice;
  if (!id || choice === noImage) return undefined;
  return wallpapers.find((wallpaper) => wallpaper.id === id);
}

function imageUrl(source: string) {
  const url = new URL(source, window.location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Wallpaper URLs must use HTTP or HTTPS.");
  }
  return url;
}

function loadImagePalette(source: string) {
  return new Promise<ReturnType<typeof deriveImagePalette>>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not create an image color sampler.");

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        resolve(deriveImagePalette(pixels));
      } catch {
        reject(
          new Error(
            "The image loaded, but its colors could not be sampled. Use a same-origin or CORS-enabled image URL."
          )
        );
      }
    };
    image.onerror = () => {
      reject(
        new Error(
          "The image could not be loaded for palette sampling. Check its URL and CORS settings."
        )
      );
    };
    image.src = source;
  });
}

async function applyChoice(choice: string, persist: boolean) {
  const sequence = ++applySequence;
  const wallpaper = getWallpaper(choice);

  if (persist) {
    try {
      localStorage.setItem(preferenceKey, choice);
    } catch {
      announce("This browser could not save the appearance preference.");
    }
  }

  if (!wallpaper) {
    document.documentElement.style.setProperty("--site-wallpaper", "none");
    setPalette(fallbackPalette);
    if (persist) {
      announce(choice === noImage ? "Using the plain dark background." : "Using the site default.");
    }
    return;
  }

  try {
    const url = imageUrl(wallpaper.src);
    document.documentElement.style.setProperty("--site-wallpaper", `url("${url.href}")`);
    setPalette(fallbackPalette);
    if (persist) announce(`Applying “${wallpaper.name}” and its color theme.`);

    const palette = wallpaper.palette ?? (await loadImagePalette(url.href));
    if (sequence !== applySequence) return;

    setPalette(palette);
    if (persist) announce(`“${wallpaper.name}” is active.`);
  } catch (error) {
    if (sequence !== applySequence) return;
    setPalette(fallbackPalette);
    announce(error instanceof Error ? error.message : "Could not apply the wallpaper palette.");
  }
}

export function initializeAppearance() {
  const controls = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-wallpaper-choice]")
  );
  const choice = readChoice();

  for (const control of controls) {
    control.setAttribute("aria-pressed", String(control.dataset.wallpaperChoice === choice));
    control.addEventListener("click", () => {
      const selectedChoice = control.dataset.wallpaperChoice;
      if (!selectedChoice || !isKnownChoice(selectedChoice)) return;

      for (const candidate of controls) {
        candidate.setAttribute(
          "aria-pressed",
          String(candidate.dataset.wallpaperChoice === selectedChoice)
        );
      }
      void applyChoice(selectedChoice, true);
    });
  }

  void applyChoice(choice, false);
}
