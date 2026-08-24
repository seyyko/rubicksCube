import { layers, layerToFace } from "./layerHandler.js"
import { colors } from "./colors.js";

const mainCube = document.getElementById("mainCube");
const scanBoxCube = document.querySelector("#scanBox .cubeContainer");

const faceAxis = {
    // Each cube has 6 faces, always oriented
    // along the same three axes.
    // For each axis, we store the corresponding
    // front and back face indices in the DOM.
    "x": [5, 6],
    "y": [3, 4],
    "z": [1, 2]
}

const faceData = [
    // Describes the six visible faces of the cube:
    // - the cube that belong to the face,
    // - the axis the face is aligned with,
    // - whether it is the front (0) or back (1)
    //   side of that axis.
    {
        cube: layers[0].grid,
        pos: "z",
        index: 1,
    },
    {
        cube: layers[4].grid,
        pos: "y",
        index: 0,
    },
    {
        cube: layers[3].grid,
        pos: "x",
        index: 1,
    },
    {
        cube: layers[2].grid,
        pos: "x",
        index: 0,
    },
    {
        cube: layers[1].grid,
        pos: "z",
        index: 0,
    },
    {
        cube: layers[5].grid,
        pos: "y",
        index: 1,
    },
]

function initMap(cubeId, colored, coloredStickersList){
    const tempMap = Array();

    // Create the six cube faces.
    // Each face contains nine stickers.
    for (let i = 0; i < 6; i++) {
        tempMap.push(Array())
        for (let j = 0; j < 9; j++) {
            tempMap[i].push({
                color: coloredStickersList.includes(j) ?
                colors[i].color :
                "rgb(34, 34, 34)",
                colorId: coloredStickersList.includes(j) ?
                i :
                null,
            })
        }
    }

    fillMap(tempMap, cubeId)
    updateBackground(tempMap, colored, coloredStickersList)
    return tempMap
}

function fillMap(map, cubeId){
    // Each sticker needs additional metadata:
    // - its piece type (corner, edge, center),
    // - the cube it belongs to,
    // - the axis it faces,
    // - whether it is on the front or back side,
    // - the corresponding DOM element.
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            // Face layout:
            // 1 2 3
            // 4 5 6
            // 7 8 9
            //
            // Even positions are edges,
            // position 5 is the center,
            // the remaining positions are corners.
            map[i][j]["piece"] = (j+1)%2 == 0 ? "edge" : (j+1) != 5 ? "corner" : "center";
            
            // Extract the cube number from identifiers
            // such as "c1", "c14", etc.
            map[i][j]["cube"]  = parseInt(faceData[i].cube[j].slice(1));
            
            // Store orientation information.
            map[i][j]["pos"]   = faceData[i].pos;      
            map[i][j]["index"] = faceData[i].index; 
            
            // Store a direct reference to the DOM face.
            map[i][j]["obj"]   = document.querySelector(`${cubeId} #c${map[i][j].cube} .face:nth-child(${faceAxis[map[i][j].pos][map[i][j].index]})`);      
        }
    }
}

function createMainCube(container){
    for (let i = 1; i <= 27; i++) {
        const cube = document.createElement("div");
        cube.id = `c${i}`;
        cube.className = "cube";

        for (let j = 0; j < 6; j++) {
            const face = document.createElement("div");
            face.className = "face";
            cube.appendChild(face);
        }

        const p = document.createElement("p");
        p.textContent = `c${i}`;
        cube.appendChild(p);

        container.appendChild(cube);
    }
}

createMainCube(mainCube)
createMainCube(scanBoxCube)

export let cubeMap = initMap("#mainCube", true, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
export let scanBoxMap = initMap("#scanBox", true, [4]);

export function resetMap(map, cubeId, colored, coloredStickersList) {
    const newMap = initMap(cubeId, colored, coloredStickersList);

    map.length = 0;
    map.push(...newMap);
}

export function updateBackground(map, colored, coloredStickersList){
    // Synchronize every sticker color with the
    // current color configuration.
    const allStickersColored = coloredStickersList.length === 9;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            if (map[i][j].colorId !== null){
                map[i][j].color = colors[map[i][j].colorId].color
            }
            if (
                colored && (
                    allStickersColored 
                    || coloredStickersList.includes(j)
                )
            ){
                map[i][j].obj.style.backgroundColor = map[i][j].color
            }
        }
    }
}

export function getPieceByFaceId(piece, faceIds, map){
    // We get pieces by colorId and not color,
    // cause user can make every face the same color
    // however colorId is unique to the face and can't be changed.
    const temp = Array();
    let pieces;
    let cubeDict;
    let max;
    let cubeCorner;
    map.forEach(element => {
        for (let i = 0; i < element.length; i++) {
            // for all pieces (56) we get those who match:
            if (element[i].piece == piece &&          // Matches the requested piece type,
                faceIds.includes(element[i].colorId)){ // and one of the requested face IDs.
                temp.push(element[i])
            }
            cubeDict = {};
            // Build a weighted object where:
            // key   = cube ID
            // value = number of matching faces found on that cube.
            for (let j = 0; j < temp.length; j++) {
                // A cube can contain up to:
                // - 3 faces for a corner,
                // - 2 faces for an edge,
                // - 1 face for a center.
                // The more matching faces a cube has, the more relevant it is.
                cubeDict[temp[j].cube] = !cubeDict[temp[j].cube] ? 1 : cubeDict[temp[j].cube] + 1;
            }

            // Find the cube(s) with the highest score.
            // Multiple cube may share the same score,
            // so the result can contain several cube IDs.
            max = Math.max(...Object.values(cubeDict));
            cubeCorner = Object.keys(cubeDict)
                .filter(key => cubeDict[key] === max)
                .map(Number);
            pieces = {};

            // Collect all matching faces that belong
            // to the selected cube(s).
            for (let j = 0; j < temp.length; j++) {
                if (cubeCorner.includes(temp[j].cube)){
                    if (!pieces[temp[j].cube]) pieces[temp[j].cube] = Array();
                    pieces[temp[j].cube].push(temp[j])
                }
            }
        }
    });
    return pieces
}

export function getFacesByCube(cube){
    const temp = Array();
    for (let i = 0; i < layers.length - 3; i++) {
        if (layers[i].grid.includes(`c${cube}`)){
            temp.push(layerToFace[layers[i].name])
        }
    }
    // should return an Array which contains
    // min 1, max 3 integers (faces).
    return temp;
}

export function getStickersByCube(map, cube){
    const temp = Array();
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j].cube === cube){
                temp.push(map[i][j]);
            }            
        }
    }
    return temp;
}

