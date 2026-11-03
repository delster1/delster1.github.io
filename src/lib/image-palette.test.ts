import assert from "node:assert/strict";
import test from "node:test";
import { deriveImagePalette } from "./image-palette";

test("derives the accent hue from colorful image pixels", () => {
  const redPixels = new Uint8ClampedArray([
    245, 20, 20, 255,
    245, 20, 20, 255,
    245, 20, 20, 255,
    245, 20, 20, 255,
  ]);
  const palette = deriveImagePalette(redPixels);

  assert.equal(palette.hue, 0);
  assert.match(palette.accent, /^hsl\(0 \d+% 76%\)$/);
  assert.equal(palette.accentInk, "#101714");
});

test("uses a dark green fallback when image pixels have no usable color", () => {
  const transparentPixels = new Uint8ClampedArray([0, 0, 0, 0]);
  const palette = deriveImagePalette(transparentPixels);

  assert.equal(palette.hue, 145);
  assert.match(palette.panelTint, /^hsl\(145 /);
});

test("keeps image-derived accent text above a 4.5:1 contrast ratio", () => {
  for (let hue = 0; hue < 360; hue += 1) {
    const [red, green, blue] = hslToRgb(hue, 1, 0.5);
    const pixels = new Uint8ClampedArray([red, green, blue, 255]);
    const palette = deriveImagePalette(pixels);

    assert.ok(
      contrastRatio(palette.accent, palette.accentInk) >= 4.5,
      `Accent contrast should meet WCAG AA at hue ${hue}`
    );
  }
});

function hslToRgb(hue: number, saturation: number, lightness: number): number[] {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const base = lightness - chroma / 2;
  const colors =
    section < 1 ? [chroma, secondary, 0] :
    section < 2 ? [secondary, chroma, 0] :
    section < 3 ? [0, chroma, secondary] :
    section < 4 ? [0, secondary, chroma] :
    section < 5 ? [secondary, 0, chroma] :
    [chroma, 0, secondary];

  return colors.map((color) => Math.round((color + base) * 255));
}

function contrastRatio(accent: string, ink: string): number {
  const [, hue, saturation, lightness] = accent.match(/^hsl\((\d+) (\d+)% (\d+)%\)$/) ?? [];
  assert.ok(
    hue !== undefined && saturation !== undefined && lightness !== undefined,
    "Palette accent should be an HSL color"
  );
  const accentRgb = hslToRgb(Number(hue), Number(saturation) / 100, Number(lightness) / 100);
  const inkRgb = [1, 3, 5].map((index) => Number.parseInt(ink.slice(index, index + 2), 16));
  const [lighter, darker] = [relativeLuminance(accentRgb), relativeLuminance(inkRgb)]
    .sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(rgb: number[]): number {
  const [red, green, blue] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
