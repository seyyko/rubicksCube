import { colors } from "./colors.js";
import { cubeMap, scanBoxMap, updateBackground } from "./cubeMap.js";
import { faceToLayer } from "./layerHandler.js";
import { createPopup } from "./popup.js";
import { validateCenters, validateColorCounts, validatePieces, validateCornersTwisted } from "./scanValidation.js";
import { initCameraScan } from "./cameraScan.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button");
const scanBoxCheckBtn = document.querySelector(".tools .checkScan button");

const mainCanvas = [
    document.querySelector("#canvas #mainCube"),
    document.querySelector("#canvas #timer")
];

export let isScanBoxShowed = false;

scanBoxBtn.addEventListener("click", () => {
    mainCanvas.forEach(element => {
        element.style.display = isScanBoxShowed ? "grid" : "none";
    });

    scanBox.style.display = isScanBoxShowed ? "none" : "grid";
    isScanBoxShowed = !isScanBoxShowed;
});

async function reportError(title, id, desc, btns) {
    const result = await createPopup(
        "errorPopup",
        title,
        id,
        desc,
        btns
    );
    console.log("A popup of that error has been successfully created.");
    return result;
}

scanBoxCheckBtn.addEventListener("click", async () => {
    const sbMap = scanBoxMap;

    const centersTest = validateCenters(sbMap);
    console.log(centersTest);

    if (!centersTest[0]) {
        const duplicateCenters = centersTest[1];

        const title = "Each face must have a different center color.";
        const id = [
            "Faces:",
            duplicateCenters
                .map(face =>
                    face[1]
                        .map(name => faceToLayer[name].replace("Layer", ""))
                        .join(", ")
                )
                .join("; ")
        ];
        const desc = [
            "share the same center color:",
            duplicateCenters.map(face => colors[face[0]].color).join("; ")
        ];

        await reportError(title, id, desc, [null, "ok"]);
        return;
    }

    console.log("Center colors are valid.");

    const colorCountTest = validateColorCounts(sbMap);
    console.log(colorCountTest);

    if (colorCountTest.length === 3) {
        const title = "There are uncolored stickers.";
        const id = [
            "Face(s)(missing sticker):",
            Object.entries(colorCountTest[2])
                .map(([key, array]) =>
                    `${faceToLayer[key].replace("Layer", "")}(${array.length})`
                )
                .join("; ")
        ];
        const desc = [
            "position(s):",
            Object.entries(colorCountTest[2])
                .map(([key, array]) =>
                    `${faceToLayer[key][0].toUpperCase()}(${array.join(", ")})`
                )
                .join("; ")
        ];

        await reportError(title, id, desc, [null, "ok"]);
        return;
    }

    if (!colorCountTest[0]) {
        const title = "The cube must contain exactly 9 stickers of each color.";
        const id = [
            "Color(s)(+/- stickers):",
            Object.entries(colorCountTest[1])
                .map(([key, nb]) => {
                    if (nb > 9) {
                        return `"${colors[key].color}"(+${nb - 9})`;
                    }

                    if (nb < 9) {
                        return `"${colors[key].color}"(-${9 - nb})`;
                    }

                    return null;
                })
                .filter(Boolean)
                .join("; ")
        ];

        await reportError(title, id, null, [null, "ok"]);
        return;
    }

    console.log("Color counts are valid.");

    const piecesTest = validatePieces(sbMap);
    console.log(piecesTest);

    if (!piecesTest[0]) {
        const title =
            "Some pieces have invalid color combinations or are duplicated.";
        const id = [
            "cube(I/D):",
            piecesTest[1]
                .map(piece => `${piece[0]}(${piece[2]})`)
                .join("; ")
        ];
        const desc = [
            "I / D:",
            "Invalid (duplicate colors) / Duplicated (duplicate pieces)"
        ];

        await reportError(title, id, desc, [null, "ok"]);
        return;
    }

    console.log("Pieces colors are valid.");

    const cornerTwist = validateCornersTwisted(sbMap);
    console.log(cornerTwist);

    if (!cornerTwist[0]) {
        const title = "Your cube has a twisted corner.";
        const id = [
            "Twist the FUR corner: ",
            cornerTwist[1] === 1 ? "anti clockwise" : "clockwise"
        ];
        const desc = [
            "FUR corner",
            "is the corner between the Front, Upper and Right faces (the closest corner to you after resetting the position)."
        ];

        await reportError(title, id, desc, [null, "ok"]);
        return;
    }

    const result = await createPopup(
        "scan",
        "Are you sure you want to replace the main cube with your scan ?",
        null,
        null,
        ["yes", "no"]
    );

    console.log("scan is ready to use !");
    console.log("do you want to update the main cube with this scan ?", result);

    if (result) {
        cubeMap.forEach((face, i) => {
            face.forEach((sticker, j) => {
                sticker.color = scanBoxMap[i][j].color;
                sticker.colorId = scanBoxMap[i][j].colorId;
            });
        });

        updateBackground(
            cubeMap,
            true,
            [0, 1, 2, 3, 4, 5, 6, 7, 8]
        );

        console.log("main cube is updated with the scan");
    }
});

initCameraScan();
