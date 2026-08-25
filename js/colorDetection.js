import { colors, flatColors } from "./colors.js";

export function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}

export function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }

    if (h < 0) {
        h += 360;
    }

    const s = max === 0 ? 0 : delta / max;

    return { h, s, v: max };
}

export function getClosestFlatColor(color) {
    if (!color) {
        return null;
    }

    const hsv = rgbToHsv(color.r, color.g, color.b);

    if (hsv.v < 0.15) {
        return null;
    }

    if (hsv.s < 0.35 && hsv.v > 0.55) {
        return flatColors.find(
            color => color.abbreviatedColor === "W"
        ) ?? null;
    }

    let closestColor = null;
    let smallestDistance = Infinity;

    for (const flatColor of flatColors) {
        if (flatColor.abbreviatedColor === "W") {
            continue;
        }

        const rgb = hexToRgb(flatColor.color);
        const flatHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

        const hueDistance = Math.min(
            Math.abs(hsv.h - flatHsv.h),
            360 - Math.abs(hsv.h - flatHsv.h)
        );

        const saturationDistance =
            Math.abs(hsv.s - flatHsv.s);

        const valueDistance =
            Math.abs(hsv.v - flatHsv.v);

        const distance =
            hueDistance / 360 +
            saturationDistance * 0.5 +
            valueDistance * 0.2;

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = flatColor;
        }
    }

    const MAX_DISTANCE = 0.25;

    if (smallestDistance > MAX_DISTANCE) {
        return null;
    }

    return closestColor;
}

export function getPastelColor(color) {
    if (!color) {
        return null;
    }

    const flatColor = getClosestFlatColor(color);

    if (!flatColor) {
        return null;
    }

    return colors.find(
        baseColor =>
            baseColor.abbreviatedColor === flatColor.abbreviatedColor
    ) ?? null;
}

export function getAverageColor(ctx, canvas, x, y, radius = 15) {
    const colorsCount = new Map();
    const pixelsByColor = new Map();

    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));
    const endX = Math.min(canvas.width, Math.round(x + radius + 1));
    const endY = Math.min(canvas.height, Math.round(y + radius + 1));

    if (startX >= endX || startY >= endY) {
        return null;
    }

    const imageData = ctx.getImageData(
        startX,
        startY,
        endX - startX,
        endY - startY
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        if (a === 0) {
            continue;
        }

        const flatColor = getClosestFlatColor({ r, g, b });

        if (!flatColor) {
            continue;
        }

        const id = flatColor.abbreviatedColor;

        colorsCount.set(
            id,
            (colorsCount.get(id) ?? 0) + 1
        );

        if (!pixelsByColor.has(id)) {
            pixelsByColor.set(id, []);
        }

        pixelsByColor.get(id).push({ r, g, b });
    }

    if (colorsCount.size === 0) {
        return null;
    }

    let dominantColor = null;
    let maxCount = 0;

    for (const [id, count] of colorsCount) {
        if (count > maxCount) {
            maxCount = count;
            dominantColor = id;
        }
    }

    const pixels = pixelsByColor.get(dominantColor);

    let r = 0;
    let g = 0;
    let b = 0;

    for (const pixel of pixels) {
        r += pixel.r;
        g += pixel.g;
        b += pixel.b;
    }

    r = Math.round(r / pixels.length);
    g = Math.round(g / pixels.length);
    b = Math.round(b / pixels.length);

    return {
        r,
        g,
        b,
        rgb: `rgb(${r}, ${g}, ${b})`
    };
}
