import { colors } from "./colors.js";
import { getStickersByCube, scanBoxMap } from "./cubeMap.js";
import { faceToLayer } from "./layerHandler.js";
import { createPopup } from "./popup.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button:nth-of-type(1)");
const scanBoxCheckBtn = document.querySelector(".tools .scan button:nth-of-type(2)");

const mainCanvas = [
    document.querySelector("#canvas #mainCube"),
    document.querySelector("#canvas #timer")
]

export let isScanBoxShowed = false;

function showScanDiv(){
    scanBox.style.display = "grid";
    mainCanvas.forEach(element => {
        element.style.display = "none";
    });
}
function hideScanDiv(){
    mainCanvas.forEach(element => {
        element.style.display = "grid";
    });
    scanBox.style.display = "none";
}

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

function reportError(title, id, desc, btns){
    const popup = document.getElementById("popup");
    createPopup("errorPopup",
        title,
        id,
        desc,
        btns
    )
    popup.style.display = "grid";
    console.log("A popup of that error has been successfully created.")
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

scanBoxCheckBtn.addEventListener("click", () => {
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
        const btns = ["", "ok"];

        reportError(title, id, desc, btns)
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
        const btns = ["", "ok"];
        reportError(title, id, desc, btns)
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
        const btns = ["", "ok"];
        reportError(title, id, desc, btns)
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
        const btns = ["", "ok"];
        reportError(title, id, desc, btns)
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
        const btns = ["", "ok"];
        reportError(title, id, desc, btns)
        return;
    }

    console.log("scan is ready to use !")
})