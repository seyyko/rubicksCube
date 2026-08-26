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

    const hsv = rgbToHsv(
        color.r,
        color.g,
        color.b
    );

    if (hsv.v < 0.15) {
        return null;
    }

    if (
        hsv.s < 0.25 &&
        hsv.v > 0.55
    ) {
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

        const flatHsv = rgbToHsv(
            rgb.r,
            rgb.g,
            rgb.b
        );

        const hueDistance = Math.min(
            Math.abs(hsv.h - flatHsv.h),
            360 - Math.abs(hsv.h - flatHsv.h)
        );

        const saturationDistance =
            Math.abs(hsv.s - flatHsv.s);

        const valueDistance =
            Math.abs(hsv.v - flatHsv.v);

        const distance =
            (hueDistance / 180) * 0.6 +
            saturationDistance * 0.25 +
            valueDistance * 0.15;

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = flatColor;
        }
    }

    const MAX_DISTANCE = 0.45;

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
    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));

    const endX = Math.min(
        canvas.width,
        Math.round(x + radius + 1)
    );

    const endY = Math.min(
        canvas.height,
        Math.round(y + radius + 1)
    );

    if (startX >= endX || startY >= endY) {
        return null;
    }

    const imageData = ctx.getImageData(
        startX,
        startY,
        endX - startX,
        endY - startY
    );

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i + 3];

        if (alpha === 0) {
            continue;
        }

        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];

        count++;
    }

    if (count === 0) {
        return null;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return {
        r,
        g,
        b,
        rgb: `rgb(${r}, ${g}, ${b})`
    };
}
