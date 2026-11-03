export type ImagePalette = {
  hue: number;
  saturation: number;
  accent: string;
  accentInk: string;
  panelTint: string;
  glow: string;
};

export function deriveImagePalette(pixels: ArrayLike<number>): ImagePalette {
  let bestHue = 145;
  let bestSaturation = 0.46;
  let bestScore = -1;

  for (let index = 0; index + 3 < pixels.length; index += 16) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.7) continue;

    const red = pixels[index] / 255;
    const green = pixels[index + 1] / 255;
    const blue = pixels[index + 2] / 255;
    const { hue, saturation, lightness } = rgbToHsl(red, green, blue);

    if (saturation < 0.16 || lightness < 0.08 || lightness > 0.94) continue;

    const score = saturation * (1 - Math.abs(lightness - 0.5) * 0.65);
    if (score > bestScore) {
      bestHue = hue;
      bestSaturation = saturation;
      bestScore = score;
    }
  }

  const hue = Math.round(bestHue) % 360;
  const saturation = Math.min(58, Math.max(36, Math.round(bestSaturation * 72)));
  const panelSaturation = Math.max(18, Math.round(saturation * 0.55));

  return {
    hue,
    saturation,
    accent: `hsl(${hue} ${saturation}% 76%)`,
    accentInk: "#101714",
    panelTint: `hsl(${hue} ${panelSaturation}% 14% / 0.88)`,
    glow: `hsl(${hue} ${saturation}% 55% / 0.22)`,
  };
}

function rgbToHsl(red: number, green: number, blue: number) {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;
  const lightness = (maximum + minimum) / 2;

  if (difference === 0) return { hue: 145, saturation: 0, lightness };

  const saturation =
    difference / (1 - Math.abs(2 * lightness - 1));
  let hue: number;

  if (maximum === red) {
    hue = ((green - blue) / difference) % 6;
  } else if (maximum === green) {
    hue = (blue - red) / difference + 2;
  } else {
    hue = (red - green) / difference + 4;
  }

  return {
    hue: ((hue * 60 + 360) % 360),
    saturation,
    lightness,
  };
}
