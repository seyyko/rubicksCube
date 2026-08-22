import { colors } from "./colors.js";
import { getPieceByFaceId, getStickersByCube, scanBoxMap } from "./cubeMap.js";
import { faceToLayer } from "./layerHandler.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button:nth-of-type(1)");
const scanBoxCheckBtn = document.querySelector(".tools .scan button:nth-of-type(2)");
// const scanBoxCube = scanBox.querySelector(".cubeContainer");

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

function reportError(error){
    console.log(error)
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
            duplicatePieces.push([i, code, "contains duplicate colors."]);
            continue;
        }

        if (pieceSet.has(code)) {
            duplicatePieces.push([i, code, "exists more than once."]);
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
                console.log(`corner ${i} value:`, j)
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
                console.log(`corner ${i} value:`, j)
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
        reportError(`Each face must have a different center color.`);
        for (let i = 0; i < duplicateCenters.length; i++) {
            const faceNames = duplicateCenters[i][1]
            .map(face => faceToLayer[face].replace("Layer", ""))
            .join(", ");
            reportError(
                `Faces ${faceNames} share the same center colorId ${
                    duplicateCenters[i][0]
                }.`
            );
        }
    }else{
        console.log("Center colors are valid.");
    }

    const colorCountTest = validateColorCounts(sbMap);
    console.log(colorCountTest)

    if (colorCountTest.length === 3){
        reportError(`There are uncolored stickers.`);
        Object.entries(colorCountTest[2]).forEach(
            ([key, array]) => {
                reportError(
                    `Face ${faceToLayer[key].replace("Layer", "")} has ${array.length} uncolored sticker(s) at positions: ${array.join(", ")}.`
                );
            }
        );
    }else if (!colorCountTest[0]){
        reportError(`The cube must contain exactly 9 stickers of each color.`);
        Object.entries(colorCountTest[1]).forEach(
            ([key, nb]) => {
                if (nb > 9) {
                    reportError(
                        `Color "${colors[key].color}" (colorId: ${key}) has ${nb - 9} too many sticker(s).`
                    );
                } else if (nb < 9) {
                    reportError(
                        `Color "${colors[key].color}" (colorId: ${key}) is missing ${9 - nb} sticker(s).`
                    );
                }
            }
        );
    }else{
        console.log("Color counts are valid.");
    }

    const piecesTest = validatePieces(sbMap);
    console.log(piecesTest)

    if (!piecesTest[0]){
        reportError(`Some pieces have invalid color combinations or are duplicated.`);
        for (let i = 0; i < piecesTest[1].length; i++) {
            reportError(`piece at cube: ${piecesTest[1][i][0]} ${piecesTest[1][i][2]}`);
        }
    }else{
        console.log("Pieces colors are valid.");
    }

    const cornerTwist = validateCornersTwisted(sbMap)
    console.log(cornerTwist);

    if (!cornerTwist[0]){
        reportError(`Your cube has a twisted corner.`);
        reportError(`Twist the FUR corner ${
            cornerTwist[1] === 1 ?
            'anti clockwise':
            'clockwise'
        }`);
    }

})