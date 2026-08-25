import { colors, flatColors } from "./colors.js";
import { cubeMap, getStickersByCube, scanBoxMap, updateBackground } from "./cubeMap.js";
import { faceToLayer, layerToFace } from "./layerHandler.js";
import { createPopup } from "./popup.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button");
const scanBoxCheckBtn = document.querySelector(".tools .checkScan button");

const mainCanvas = [
    document.querySelector("#canvas #mainCube"),
    document.querySelector("#canvas #timer")
]

export let isScanBoxShowed = false;

scanBoxBtn.addEventListener("click", () => {
    mainCanvas.forEach(element => {
        element.style.display = 
            isScanBoxShowed ?
            "grid":
            "none";
    });
    scanBox.style.display = 
        isScanBoxShowed ?
        "none":
        "grid";

    isScanBoxShowed = !isScanBoxShowed
});

async function reportError(title, id, desc, btns){
    const popup = document.getElementById("popup");
    
    const result = await createPopup("errorPopup",
        title,
        id,
        desc,
        btns
    )
    console.log("A popup of that error has been successfully created.")
    return result
}

function validateCenters(map){
    const centerId = 4;
    const tempSet = new Set();
    for (let i = 0; i < map.length; i++) {
        if (!tempSet.has(map[i][centerId].colorId)){
            tempSet.add(map[i][centerId].colorId);
        }
    }
    return [tempSet.size === 6, getDuplicateCenters(map)];
}

function getDuplicateCenters(map){
    const centerId = 4;
    const tempObj = {};
    for (let i = 0; i < map.length; i++) {
        if (!tempObj[map[i][centerId].colorId]){
            tempObj[map[i][centerId].colorId] = new Array();
        }
        tempObj[map[i][centerId].colorId].push(i)
    }

    const result = Object.entries(tempObj)
    .filter(([key, array]) => array.length > 1);

    return result;
}

function validateColorCounts(map){
    const tempObj = {};
    const uncoloredArray = {};
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j].colorId === null){
                if(!uncoloredArray[i]){
                    uncoloredArray[i] = Array();
                }
                uncoloredArray[i].push(j)
            }
            if (!tempObj[map[i][j].colorId]){
                tempObj[map[i][j].colorId] = 0;
            }
            tempObj[map[i][j].colorId] += 1;
        }
    }

    if (tempObj["null"]){
        return [false, tempObj, uncoloredArray];
    }
    for (const key in tempObj) {
        if (tempObj[key] !== 9) {
            return [false, tempObj];
        }
    }
    return [true, tempObj];
}

function validatePieces(map) {
    const duplicatePieces = [];
    const pieceSet = new Set();

    for (let i = 1; i < 28; i++) {
        const pieces = getStickersByCube(map, i);

        if (pieces.length === 0) {
            continue;
        }

        const colorIds = pieces.map(piece => piece.colorId === null ? "N" : piece.colorId);
        const code = colorIds.join("");

        if (new Set(colorIds).size !== colorIds.length) {
            // invalid composition.
            duplicatePieces.push([i, code, "I"]);
            continue;
        }

        if (pieceSet.has(code)) {
            // duplicated composition.
            duplicatePieces.push([i, code, "D"]);
            continue;
        }

        pieceSet.add(code);
    }

    return [
        pieceSet.size === 26 && duplicatePieces.length === 0,
        duplicatePieces
    ];
}

function validateCornersTwisted(map){
    const upperCornersCube = [3, 21, 19, 1]
    const downCornersCube = [27, 9, 7, 25]
    const upperCornersFaces = [
        [[1, 2, 0], [8, 0, 2]],
        [[1, 4, 2], [2, 8, 2]],
        [[1, 3, 4], [0, 0, 6]],
        [[1, 0, 3], [6, 0, 2]],
    ]
    const downCornersFaces = [
        [[5, 2, 4], [8, 8, 2]],
        [[5, 0, 2], [2, 8, 6]],
        [[5, 3, 0], [0, 8, 6]],
        [[5, 4, 3], [6, 0, 6]],
    ]
    const upperLayerColor = map[1][4].colorId;
    const downLayerColor = map[5][4].colorId;
    const layersColor = [
        upperLayerColor,
        downLayerColor
    ]
    const tempObj = new Object();

    let score = 0;

    for (let i = 0; i < upperCornersFaces.length; i++) {
        for (let j = 0; j < upperCornersFaces[i][0].length; j++) {
            const upperFace = upperCornersFaces[i][0][j]
            const upperSticker = upperCornersFaces[i][1][j]
            
            if (layersColor.includes(map[upperFace][upperSticker].colorId)){
                tempObj[upperCornersCube[i]] = j
                score += j;
                break;
            }
        }        
    }
    for (let i = 0; i < upperCornersFaces.length; i++) {
        for (let j = 0; j < upperCornersFaces[i][0].length; j++) {
            const downFace = downCornersFaces[i][0][j]
            const downSticker = downCornersFaces[i][1][j]
            
            if (layersColor.includes(map[downFace][downSticker].colorId)){
                tempObj[downCornersCube[i]] = j
                score += j;
                break;
            }
        }        
    }

    return [score % 3 === 0, score % 3, tempObj]
}

scanBoxCheckBtn.addEventListener("click", async () => {
    const originalColor = "rgb(34, 34, 34)";
    let sbMap = scanBoxMap;
    let error = false;
    console.log(sbMap)

    const centersTest = validateCenters(sbMap);
    console.log(centersTest)

    if (!centersTest[0]) {
        const duplicateCenters = centersTest[1];
        const title = `Each face must have a different center color.`;
        const id = ["Faces:", duplicateCenters
            .map(face => face[1]
                .map(name => faceToLayer[name].replace("Layer", ""))
                .join(", ")
            ).join("; ")
        ];
        const desc = ["share the same center color:", duplicateCenters
            .map(face => colors[face[0]].color).join("; ")];
        const btns = [null, "ok"];

        await reportError(title, id, desc, btns)
        return;
    }else{
        console.log("Center colors are valid.");
    }

    const colorCountTest = validateColorCounts(sbMap);
    console.log(colorCountTest)

    if (colorCountTest.length === 3){
        const title = `There are uncolored stickers.`
        const id = ["Face(s)(missing sticker):", Object.entries(colorCountTest[2])
            .map(([key, array]) => `${faceToLayer[key].replace("Layer", "")}(${array.length})`)
            .join("; ")
        ];
        const desc = ["position(s):", Object.entries(colorCountTest[2])
            .map(([key, array]) => `${faceToLayer[key][0].toUpperCase()}(${array.join(", ")})`)
            .join("; ")
        ];
        const btns = [null, "ok"];
        await reportError(title, id, desc, btns)
        return;
    }else if (!colorCountTest[0]){
        const title = `The cube must contain exactly 9 stickers of each color.`
        const id = ["Color(s)(+/- stickers):", Object.entries(colorCountTest[1])
            .map(([key, nb]) => {
                if (nb > 9) {
                    return `"${colors[key].color}"(+${nb - 9})`;
                } else if (nb < 9) {
                    return `"${colors[key].color}"(-${9 - nb})`;
                }
            })
            .filter(Boolean)
            .join("; ")
        ];
        const desc = null
        const btns = [null, "ok"];
        await reportError(title, id, desc, btns)
        return;
    }else{
        console.log("Color counts are valid.");
    }

    const piecesTest = validatePieces(sbMap);
    console.log(piecesTest)

    if (!piecesTest[0]){
        const title = `Some pieces have invalid color combinations or are duplicated.`
        const id = ["cube(I/D):", piecesTest[1]
            .map(piece => `${piece[0]}(${piece[2]})`)
            .join("; ")
        ];
        const desc = ["I / D:", "Invalid (duplicate colors) / Duplicated (duplicate pieces)"]
        const btns = [null, "ok"];
        await reportError(title, id, desc, btns)
        return;
    }else{
        console.log("Pieces colors are valid.");
    }

    const cornerTwist = validateCornersTwisted(sbMap)
    console.log(cornerTwist);

    if (!cornerTwist[0]){
        const title = `Your cube has a twisted corner.`
        const id = ["Twist the FUR corner: ", `${cornerTwist[1] === 1 ?
            'anti clockwise':
            'clockwise'}`
        ];
        const desc = [
            "FUR corner", 
            "is the corner between the Front, Upper and Right faces (the closest corner to you after resetting the position)."
        ];
        const btns = [null, "ok"];
        await reportError(title, id, desc, btns)
        return;
    }

    const result = await createPopup(
        "scan",
        "Are you sure you want to replace the main cube with your scan ?",
        null,
        null,
        ["yes", "no"]
    );

    console.log("scan is ready to use !")
    console.log("do you want to update the main cube with this scan ?", result)

    if (result){
        cubeMap.forEach((face, i) => {
            face.forEach((sticker, j) => {
                sticker.color = scanBoxMap[i][j].color;
                sticker.colorId = scanBoxMap[i][j].colorId;
            });
        });
        updateBackground(cubeMap, true, [0, 1, 2, 3, 4, 5, 6, 7, 8])
        console.log("main cube is updated with the scan")
    }
})

function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}


function rgbToHsv(r, g, b) {
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

    return {
        h,
        s,
        v: max
    };
}


function getClosestFlatColor(color) {

    const hsv = rgbToHsv(
        color.r,
        color.g,
        color.b
    );

    // Reject very dark pixels such as the background.
    if (hsv.v < 0.15) {
        return null;
    }

    /*
     * White is achromatic, so hue is not useful here.
     * Allow more saturation because real photos can
     * give white stickers a slight color tint.
     */
    if (hsv.s < 0.35 && hsv.v > 0.55) {
        return flatColors.find(
            color => color.abbreviatedColor === "W"
        );
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

        // Circular hue distance.
        const hueDistance = Math.min(
            Math.abs(hsv.h - flatHsv.h),
            360 - Math.abs(hsv.h - flatHsv.h)
        );

        // Compare saturation and brightness too.
        const saturationDistance =
            Math.abs(hsv.s - flatHsv.s);

        const valueDistance =
            Math.abs(hsv.v - flatHsv.v);

        /*
         * Hue is the most important property,
         * but saturation and brightness help distinguish
         * colors under real-world lighting.
         */
        const distance =
            hueDistance / 360 +
            saturationDistance * 0.5 +
            valueDistance * 0.2;

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = flatColor;
        }
    }

    /*
     * Reject pixels that are too different from every
     * known cube color.
     */
    const MAX_DISTANCE = 0.25;

    if (smallestDistance > MAX_DISTANCE) {
        return null;
    }

    return closestColor;
}


function getPastelColor(color) {
    if (!color) {
        return null;
    }

    const flatColor = getClosestFlatColor(color);

    if (!flatColor) {
        return null;
    }

    return colors.find(
        baseColor =>
            baseColor.abbreviatedColor ===
            flatColor.abbreviatedColor
    ) ?? null;
}

const cameraInput = document.querySelector("#camera input");
const cameraBtns = document.querySelectorAll("#camera button");

const cropContainer = document.getElementById("crop");
const cameraCropBox = document.querySelector("#crop > div");
const image = cameraCropBox.querySelector("#crop img");
const cropConfirm = document.querySelector("#crop button");

const anchors = document.querySelectorAll("#crop > div > div");

let faceScanned = null;

// Canvas used to read image pixels
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// camera
cameraBtns.forEach(button => {
    button.addEventListener("pointerdown", event => {
        faceScanned = button.classList[0];

        if (event.button === 2) {
            button.classList.remove("active");
            const face = scanBoxMap[layerToFace[`${faceScanned}Layer`]]
            console.log("testouille", face)
            for (let i = 0; i < face.length; i++) {
                face[i].color = "rgb(0, 0, 0)"
                face[i].colorId = null
            }
            updateBackground(scanBoxMap, true, [0, 1, 2, 3, 4, 5, 6, 7, 8])
            return;
        }

        cameraInput.click();
    });

});


// image
cameraInput.addEventListener("change", () => {
    const file = cameraInput.files[0];
    if (!file) {
        return;
    }

    const url = URL.createObjectURL(file);
    image.onload = () => {
        // Get the image's actual dimensions
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Draw the original image onto the canvas
        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight
        );
        cropContainer.classList.add("show");
        URL.revokeObjectURL(url);
    };
    image.src = url;
});


// pixel / color
// function getPixelColor(x, y) {
//     // Keep coordinates inside the image
//     x = Math.max(0, Math.min(Math.round(x), canvas.width - 1));
//     y = Math.max(0, Math.min(Math.round(y), canvas.height - 1));
//     const pixel = ctx.getImageData(x, y, 1, 1).data;
//     return {
//         r: pixel[0],
//         g: pixel[1],
//         b: pixel[2],
//         a: pixel[3],
//         rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
//     };
// }

function getAverageColor(x, y, radius = 15) {
    const colorsCount = new Map();
    const pixelsByColor = new Map();

    const startX = Math.max(
        0,
        Math.round(x - radius)
    );

    const startY = Math.max(
        0,
        Math.round(y - radius)
    );

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

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        if (a === 0) continue;

        const flatColor = getClosestFlatColor({
            r,
            g,
            b
        });

        if (!flatColor) continue;

        const id = flatColor.abbreviatedColor;

        colorsCount.set(
            id,
            (colorsCount.get(id) ?? 0) + 1
        );

        if (!pixelsByColor.has(id)) {
            pixelsByColor.set(id, []);
        }

        pixelsByColor.get(id).push({
            r,
            g,
            b
        });
    }

    if (colorsCount.size === 0) {
        return null;
    }

    // Couleur la plus présente
    let dominantColor = null;
    let maxCount = 0;

    for (const [id, count] of colorsCount) {
        if (count > maxCount) {
            maxCount = count;
            dominantColor = id;
        }
    }

    // Pixels appartenant à la couleur dominante
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


// anchor position in image
function getAnchorImagePosition(anchor) {
    const cropRect = cameraCropBox.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    const screenX =
        anchorRect.left + anchorRect.width / 2;

    const screenY =
        anchorRect.top + anchorRect.height / 2;

    // Position dans le crop
    const cropX = screenX - cropRect.left;
    const cropY = screenY - cropRect.top;

    // Position dans l'image avant transform
    const localX = (cropX - x) / scale;
    const localY = (cropY - y) / scale;

    // Taille réelle de l'image avec object-fit: contain
    const imageWidth = image.clientWidth;
    const imageHeight = image.clientHeight;

    const imageRatio =
        image.naturalWidth / image.naturalHeight;

    const containerRatio =
        imageWidth / imageHeight;

    let displayedWidth;
    let displayedHeight;
    let offsetX;
    let offsetY;

    if (imageRatio > containerRatio) {
        // Image limitée par la largeur
        displayedWidth = imageWidth;
        displayedHeight = imageWidth / imageRatio;

        offsetX = 0;
        offsetY = (imageHeight - displayedHeight) / 2;
    } else {
        // Image limitée par la hauteur
        displayedHeight = imageHeight;
        displayedWidth = imageHeight * imageRatio;

        offsetX = (imageWidth - displayedWidth) / 2;
        offsetY = 0;
    }

    const imageX =
        (localX - offsetX) *
        image.naturalWidth /
        displayedWidth;

    const imageY =
        (localY - offsetY) *
        image.naturalHeight /
        displayedHeight;

    return {
        x: imageX,
        y: imageY
    };
}


// scan confirmation
cropConfirm.addEventListener("click", () => {
    const scannedColors = [];

    anchors.forEach(anchor => {
        const position = getAnchorImagePosition(anchor);

        const color = getAverageColor(
            position.x,
            position.y,
            30
        );

        const pastelColor = getPastelColor(color);

        scannedColors.push(pastelColor);

        // console.log({
        //     position,
        //     rgb: color.rgb,
        //     hsv: rgbToHsv(color.r, color.g, color.b),
        //     result: pastelColor
        // });
    });

    console.log(scannedColors);

    const face = scanBoxMap[layerToFace[`${faceScanned}Layer`]]
    if (faceScanned === "back"){
        for (
            let i = 8;
            i > -1;
            i--
        ) {
            if (scannedColors[8 - i] !== null){
                face[i].color = scannedColors[8 - i].color
                face[i].colorId = colors.indexOf(scannedColors[8 - i])
            }else{
                face[i].color = "rgb(0, 0, 0)"
                face[i].colorId = null
            }
        }
    }else{
        for (
            let i = 0;
            i < face.length;
            i++
        ) {
            if (scannedColors[i] !== null){
                face[i].color = scannedColors[i].color
                face[i].colorId = colors.indexOf(scannedColors[i])
            }else{
                face[i].color = "rgb(0, 0, 0)"
                face[i].colorId = null
            }
        }
    }
    
    updateBackground(scanBoxMap, true, [0, 1, 2, 3, 4, 5, 6, 7, 8])

    console.log(scanBoxMap);

    cropContainer.classList.remove("show");

    document
        .querySelector(`button.${faceScanned}`)
        .classList.add("active");
});

// image drag / zoom
let isDragging = false;

let x = 0;
let y = 0;
let scale = 1;

let lastX = 0;
let lastY = 0;

const pointers = new Map();

let lastDistance = null;


// transform
function updateTransform() {
    image.style.transform = `
        translate(${x}px, ${y}px)
        scale(${scale})
    `;
}

cameraCropBox.addEventListener("pointerdown", event => {
    pointers.set(event.pointerId, event);
    // Pinch zoom
    if (pointers.size === 2) {
        isDragging = false;
        const [p1, p2] = pointers.values();
        lastDistance = Math.hypot(
            p2.clientX - p1.clientX,
            p2.clientY - p1.clientY
        );
        return;
    }

    // Drag
    isDragging = true;

    lastX = event.clientX;
    lastY = event.clientY;

    cameraCropBox.setPointerCapture(
        event.pointerId
    );
});

cameraCropBox.addEventListener("pointermove", event => {
    pointers.set(event.pointerId, event);

    // Pinch zoom
    if (pointers.size === 2) {
        const [p1, p2] = pointers.values();
        const centerX =
            (p1.clientX + p2.clientX) / 2;
        const centerY =
            (p1.clientY + p2.clientY) / 2;
        const distance = Math.hypot(
            p2.clientX - p1.clientX,
            p2.clientY - p1.clientY
        );

        if (lastDistance !== null) {
            const oldScale = scale;
            scale *= distance / lastDistance;
            scale = Math.max(
                0.5,
                Math.min(scale, 8)
            );

            const rect =
                cameraCropBox.getBoundingClientRect();
            const pointX =
                centerX - rect.left;
            const pointY =
                centerY - rect.top;

            // Get the image coordinates under the fingers
            const imageX =
                (pointX - x) / oldScale;
            const imageY =
                (pointY - y) / oldScale;

            // Keep the same pixel under the fingers
            x =
                pointX -
                imageX * scale;
            y =
                pointY -
                imageY * scale;

            updateTransform();
        }
        lastDistance = distance;
        return;
    }

    // Drag
    if (!isDragging) {
        return;
    }

    const deltaX =
        event.clientX - lastX;
    const deltaY =
        event.clientY - lastY;

    x += deltaX;
    y += deltaY;

    lastX = event.clientX;
    lastY = event.clientY;

    updateTransform();
});

cameraCropBox.addEventListener("pointerup", event => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) {
        lastDistance = null;
    }

    isDragging = false;
});

cameraCropBox.addEventListener("pointercancel", event => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) {
        lastDistance = null;
    }

    isDragging = false;
});

cameraCropBox.addEventListener(
    "wheel",
    event => {
        if (!event.ctrlKey) {
            return;
        }
        event.preventDefault();

        const rect =
            cameraCropBox.getBoundingClientRect();
        const pointX =
            event.clientX - rect.left;
        const pointY =
            event.clientY - rect.top;
        const oldScale = scale;
        scale *= Math.exp(
            -event.deltaY * 0.001
        );

        scale = Math.max(
            0.5,
            Math.min(scale, 8)
        );

        // Get the image coordinates under the cursor
        const imageX =
            (pointX - x) / oldScale;
        const imageY =
            (pointY - y) / oldScale;

        // Keep the same pixel under the cursor
        x =
            pointX -
            imageX * scale;
        y =
            pointY -
            imageY * scale;

        updateTransform();
    },
    { passive: false }
);