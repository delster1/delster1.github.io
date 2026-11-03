import type { ImagePalette } from "../lib/image-palette";

export type Wallpaper = {
  id: string;
  name: string;
  src: string;
  palette?: Pick<ImagePalette, "accent" | "accentInk" | "panelTint" | "glow">;
};

export const wallpapers: Wallpaper[] = [
  {
    id: "baqueira-beret",
    name: "Baqueira Beret",
    src: "https://www.bwallpaperhd.com/wp-content/uploads/2025/02/SkiResortBaqueiraBeret-1366x768.jpg",
    palette: {
      accent: "hsl(334 58% 76%)",
      accentInk: "#101714",
      panelTint: "hsl(334 32% 14% / 0.88)",
      glow: "hsl(334 58% 55% / 0.22)",
    },
  },
  {
    id: "alpine-sunset",
    name: "Alpine Sunset",
    src: "https://wallpaperaccess.com/full/208127.jpg",
    palette: {
      accent: "hsl(343 49% 76%)",
      accentInk: "#101714",
      panelTint: "hsl(343 27% 14% / 0.88)",
      glow: "hsl(343 49% 55% / 0.22)",
    },
  },
  {
    id: "snowy-mountain-forest",
    name: "Snowy Mountain Forest",
    src: "https://images.wallpapersden.com/image/download/forest-snowy-winter-mountains_bGdoZWuUmZqaraWkpJRobWllrWdma2U.jpg",
    palette: {
      accent: "hsl(209 58% 76%)",
      accentInk: "#101714",
      panelTint: "hsl(209 32% 14% / 0.88)",
      glow: "hsl(209 58% 55% / 0.22)",
    },
  },
  {
    id: "whistler-creekside",
    name: "Whistler Creekside",
    src: "https://www.10wallpaper.com/wallpaper/2560x1600/2404/Forest_Snow_Mountain_Creekside_Whistler_Bing_4K_2560x1600.jpg",
    palette: {
      accent: "hsl(225 58% 76%)",
      accentInk: "#101714",
      panelTint: "hsl(225 32% 14% / 0.88)",
      glow: "hsl(225 58% 55% / 0.22)",
    },
  },
];

export const defaultWallpaperId = "baqueira-beret";
