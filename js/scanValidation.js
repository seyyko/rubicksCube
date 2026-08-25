import { getStickersByCube } from "./cubeMap.js";

export function validateCenters(map) {
    const centerId = 4;
    const tempSet = new Set();

    for (let i = 0; i < map.length; i++) {
        if (!tempSet.has(map[i][centerId].colorId)) {
            tempSet.add(map[i][centerId].colorId);
        }
    }

    return [tempSet.size === 6, getDuplicateCenters(map)];
}

function getDuplicateCenters(map) {
    const centerId = 4;
    const tempObj = {};

    for (let i = 0; i < map.length; i++) {
        if (!tempObj[map[i][centerId].colorId]) {
            tempObj[map[i][centerId].colorId] = [];
        }

        tempObj[map[i][centerId].colorId].push(i);
    }

    return Object.entries(tempObj)
        .filter(([key, array]) => array.length > 1);
}

export function validateColorCounts(map) {
    const tempObj = {};
    const uncoloredArray = {};

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j].colorId === null) {
                if (!uncoloredArray[i]) {
                    uncoloredArray[i] = [];
                }

                uncoloredArray[i].push(j);
            }

            if (!tempObj[map[i][j].colorId]) {
                tempObj[map[i][j].colorId] = 0;
            }

            tempObj[map[i][j].colorId] += 1;
        }
    }

    if (tempObj["null"]) {
        return [false, tempObj, uncoloredArray];
    }

    for (const key in tempObj) {
        if (tempObj[key] !== 9) {
            return [false, tempObj];
        }
    }

    return [true, tempObj];
}

export function validatePieces(map) {
    const duplicatePieces = [];
    const pieceSet = new Set();

    for (let i = 1; i < 28; i++) {
        const pieces = getStickersByCube(map, i);

        if (pieces.length === 0) {
            continue;
        }

        const colorIds = pieces.map(
            piece => piece.colorId === null ? "N" : piece.colorId
        );

        const code = colorIds.join("");

        if (new Set(colorIds).size !== colorIds.length) {
            duplicatePieces.push([i, code, "I"]);
            continue;
        }

        if (pieceSet.has(code)) {
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

export function validateCornersTwisted(map) {
    const upperCornersCube = [3, 21, 19, 1];
    const downCornersCube = [27, 9, 7, 25];

    const upperCornersFaces = [
        [[1, 2, 0], [8, 0, 2]],
        [[1, 4, 2], [2, 8, 2]],
        [[1, 3, 4], [0, 0, 6]],
        [[1, 0, 3], [6, 0, 2]]
    ];

    const downCornersFaces = [
        [[5, 2, 4], [8, 8, 2]],
        [[5, 0, 2], [2, 8, 6]],
        [[5, 3, 0], [0, 8, 6]],
        [[5, 4, 3], [6, 0, 6]]
    ];

    const upperLayerColor = map[1][4].colorId;
    const downLayerColor = map[5][4].colorId;
    const layersColor = [upperLayerColor, downLayerColor];

    const tempObj = {};
    let score = 0;

    for (let i = 0; i < upperCornersFaces.length; i++) {
        for (let j = 0; j < upperCornersFaces[i][0].length; j++) {
            const upperFace = upperCornersFaces[i][0][j];
            const upperSticker = upperCornersFaces[i][1][j];

            if (layersColor.includes(map[upperFace][upperSticker].colorId)) {
                tempObj[upperCornersCube[i]] = j;
                score += j;
                break;
            }
        }
    }

    for (let i = 0; i < downCornersFaces.length; i++) {
        for (let j = 0; j < downCornersFaces[i][0].length; j++) {
            const downFace = downCornersFaces[i][0][j];
            const downSticker = downCornersFaces[i][1][j];

            if (layersColor.includes(map[downFace][downSticker].colorId)) {
                tempObj[downCornersCube[i]] = j;
                score += j;
                break;
            }
        }
    }

    return [score % 3 === 0, score % 3, tempObj];
}
