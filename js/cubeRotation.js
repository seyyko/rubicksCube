import { cubeMap, updateBackground } from "./cubeMap.js"
import { layers, layer, resetLayer } from "./layerHandler.js"
import { getMoveParameters, addMove } from "./history.js";
import { renderMap } from "./cubeRenderer.js"
import { wait } from "./shuffle.js";

// exemple of input in script.js
export async function layerMove(name, direction, map, nbRotation=1, animationDuration=0, changeBg=false){
    const promises = [];

    if (animationDuration > 0){
        // If a previous animation was interrupted,
        // restore the layer before starting a new one.
        if (layer.childElementCount !== 0) {
            resetLayer();
        }
    }

    for (let i = 0; i < name.length; i++) {
        promises.push(
            executeLayerMove(name[i], parseInt(direction[i]), map, parseInt(nbRotation), animationDuration, changeBg)
        );
    }

    await Promise.all(promises);

    if (changeBg) {
        layer.className = "layer";
        updateBackground(map, true);
    } else {
        updateBackground(map, false);
    }
}

async function executeLayerMove(name, direction, map, nbRotation, animationDuration){
    const fullAnimationDuration = animationDuration * nbRotation;
    if (fullAnimationDuration > 0){
        const layerName = getLayerByName(name);
        const layerGrid = layerName.grid;
        const layerRotateAxis = layerName.rotateAxis.toUpperCase();

        // Update CSS variables used by the animation.
        layer.style.setProperty("--rotate-value", `calc(90deg * ${nbRotation})`)
        document.documentElement.style.setProperty("--animation-duration", fullAnimationDuration / 1000)
        
        // The animation itself is entirely handled by CSS.
        layer.className = `layer rotate${layerRotateAxis} ${direction > 0 ? "normal" : "reverse"}`;
        layerGrid.forEach(id => { 
            layer.appendChild(document.querySelectorAll(`.cube#${id}`)[0]);
        })
    }

    const moveData = getMoveData(name, direction, map);

    console.log(`
######################### \n
movement name            : ${name[0].toUpperCase()}${direction < 0 ? "'" : ""}\n
face moving              : ${name}\n
direction                : ${direction}\n
number of rotation       : ${nbRotation}\n
animation duration (ms)  : ${fullAnimationDuration}\n
######################### \n\n`)

    console.log("map before movement:")
    renderMap(cubeMap)

    // Update the internal cube state immediately.
    // The visual animation will catch up afterwards.
    for (let i = 0; i < nbRotation; i++) {
        // M, E and S moves do not rotate a visible face.
        if (!moveData.oneLayer){
            rotateFace(moveData.face, moveData.direct);
        }
        rotateSides(
            ...moveData.sides,
            moveData.sideIndex,
            moveData.direct
        );
    }

    await wait(fullAnimationDuration);

    console.log("map after movement:")
    renderMap(cubeMap)
    console.log("map object:", cubeMap)
}

function getLayerByName(name){
    for (let i = 0; i < layers.length; i++) {
        if(layers[i].name == name){
            return layers[i]
        };
    }
}

function getMoveData(name, direction, map){
    // Returns every piece of information required
    // to perform a move:
    // - face to rotate,
    // - adjacent sides,
    // - affected sticker indices,
    // - rotation direction.
    switch(name){
        case "frontLayer":
            return{
                face: map[0],
                // Adjacent faces ordered clockwise
                // when looking directly at the front face.
                sides: [
                    map[1],
                    map[2],
                    map[5],
                    map[3]
                ],
                // Stickers affected on each side.
                // Debug mode is very useful to visualize
                // these coordinates.
                sideIndex: [  
                    [7, 8, 9],
                    [1, 4, 7],
                    [1, 2, 3],
                    [3, 6, 9] 
                ],
                direct: direction,
                oneLayer: false
            };
        case "backLayer":
            return{
                face: map[4],
                sides: [
                    map[5],
                    map[2],
                    map[1],
                    map[3]
                ],
                sideIndex: [
                    [7, 8, 9],
                    [9, 6, 3],
                    [1, 2, 3],
                    [7, 4, 1]
                ],
                // Looking at the back face reverses
                // the perceived rotation direction.
                direct: direction * -1,
                oneLayer: false
            };
        case "leftLayer":
            return{
                face: map[3],
                sides: [
                    map[0],
                    map[5],
                    map[4],
                    map[1]
                ],
                sideIndex: [
                    [1, 4, 7],
                    [1, 4, 7],
                    [7, 4, 1],
                    [7, 4, 1]
                ],
                direct: direction * -1,
                oneLayer: false
            };
        case "rightLayer":
            return{
                face: map[2],
                sides: [
                    map[1],
                    map[4],
                    map[5],
                    map[0]
                ],
                sideIndex: [
                    [9, 6, 3],
                    [9, 6, 3],
                    [3, 6, 9],
                    [3, 6, 9]
                ],
                direct: direction,
                oneLayer: false
            };
        case "upperLayer":
            return{
                face: map[1],
                sides: [
                    map[4],
                    map[2],
                    map[0],
                    map[3]
                ],
                sideIndex: [
                    [7, 8, 9],
                    [3, 2, 1],
                    [1, 2, 3],
                    [1, 2, 3]
                ],
                direct: direction * -1,
                oneLayer: false
            };
        case "downLayer":
            return{
                face: map[5],
                sides: [
                    map[0],
                    map[2],
                    map[4],
                    map[3]
                ],
                sideIndex: [
                    [7, 8, 9],
                    [7, 8, 9],
                    [1, 2, 3],
                    [9, 8, 7]
                ],
                direct: direction,
                oneLayer: false
            }

        // Slice moves.
        // They only affect the middle layer and
        // therefore have no visible face to rotate.
        case "middleLayer":
            return{
                sides: [
                    map[1],
                    map[4],
                    map[5],
                    map[0]
                ],
                sideIndex: [
                    [8, 5, 2],
                    [8, 5, 2],
                    [2, 5, 8],
                    [2, 5, 8]
                ],
                direct: direction,
                oneLayer: true
            };
        case "equatorLayer":
            return{
                sides: [
                    map[4],
                    map[2],
                    map[0],
                    map[3]
                ],
                sideIndex: [
                    [4, 5, 6],
                    [6, 5, 4],
                    [4, 5, 6],
                    [4, 5, 6]
                ],
                direct: direction * -1,
                oneLayer: true
            };
        case "standingLayer":
            return{
                sides: [
                    map[1],
                    map[2],
                    map[5],
                    map[3]
                ],
                sideIndex: [
                    [4, 5, 6],
                    [2, 5, 8],
                    [4, 5, 6],
                    [2, 5, 8]
                ],
                direct: direction,
                oneLayer: true
            };
    }
}

function rotateFace(face, direction){
    // Create a snapshot of the current face
    // before overwriting any sticker.
    const faceTemp = Array();
    for (let i = 0; i < face.length; i++) {
        faceTemp.push({
            "color": face[i].color,
            "faceId": face[i].faceId,
        })        
    }

    // Clockwise permutation.
    let faceTempIndex = [6, 3, 0, 7, 4, 1, 8, 5, 2]
    // Counter-clockwise permutation.
    if (direction < 0) faceTempIndex.reverse();

    for (let i = 0; i < face.length; i++) {
        swapStickers(face[i], faceTemp[faceTempIndex[i]])
    }
}

function rotateSides(side1, side2, side3, side4, sideIndex, direction){
    // Temporary storage for the four rows/columns
    // exchanged during the move.
    const faceTemp1 = Array();
    const faceTemp2 = Array();
    const faceTemp3 = Array();
    const faceTemp4 = Array();
    const sideIndex1 = sideIndex[0];
    const sideIndex2 = sideIndex[1];
    const sideIndex3 = sideIndex[2];
    const sideIndex4 = sideIndex[3];

    for (let i = 0; i < 3; i++) {
        // Some strips must be reversed when moving
        // between faces with different orientations.
        let counterClockwiseIndex;
        let clockwiseIndex;

        counterClockwiseIndex = (2 * (direction > 0))-i;
        clockwiseIndex = (2 * (direction < 0))-i;
        counterClockwiseIndex = counterClockwiseIndex < 0 ? counterClockwiseIndex * -1 : counterClockwiseIndex;
        clockwiseIndex = clockwiseIndex < 0 ? clockwiseIndex * -1 : clockwiseIndex;

        faceTemp1.push({
            "color": side1[sideIndex1[clockwiseIndex] - 1].color,
            "faceId": side1[sideIndex1[clockwiseIndex] - 1].faceId
        });
        faceTemp2.push({
            "color": side2[sideIndex2[counterClockwiseIndex] - 1].color,
            "faceId": side2[sideIndex2[counterClockwiseIndex] - 1].faceId
        });
        faceTemp3.push({
            "color": side3[sideIndex3[clockwiseIndex] - 1].color,
            "faceId": side3[sideIndex3[clockwiseIndex] - 1].faceId
        });
        faceTemp4.push({
            "color": side4[sideIndex4[counterClockwiseIndex] - 1].color,
            "faceId": side4[sideIndex4[counterClockwiseIndex] - 1].faceId
        });
    }

    // Clockwise cycle.
    let faceTempIndex = [faceTemp4, faceTemp1, faceTemp2, faceTemp3]
    let sideList = [
        [side1, sideIndex1],
        [side2, sideIndex2],
        [side3, sideIndex3],
        [side4, sideIndex4],
    ]
    // Counter-clockwise cycle.
    if (direction < 0) faceTempIndex = swapIndex(faceTempIndex, [2, 3, 0, 1]);

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            swapStickers(sideList[i][0][sideList[i][1][j] - 1], faceTempIndex[i][j])
        }
    }
}

function swapIndex(list, newIndex){
    // Returns a reordered copy of an array
    // according to the provided indices.
    let temp = Array()
    for (let i = 0; i < list.length; i++) {
        temp[i] = list[newIndex[i]];
    }
    return temp
}

function swapStickers(sticker, target){
    // Only sticker data is exchanged.
    // Cube positions remain unchanged.
    sticker.faceId = target.faceId
    sticker.color = target.color
}

export function getOptimalMove(faceName, cubePos, targetPos){
    let grid;
    let move = faceName[0].toUpperCase();
    for (let i = 0; i < layers.length - 3; i++) {
        if (faceName === layers[i].name){
            grid = layers[i].grid.map(pos => parseInt(pos.slice(1)));
            break;
        }
    }

    if (cubePos === targetPos){
        return "";
    }else{
        let clockwiseTurn = [grid[7], grid[3], grid[1], grid[5]];
        let index = clockwiseTurn.indexOf(cubePos);
        let count = 0;

        while (clockwiseTurn[(index + count + 1) % 4] !== targetPos){
            count++;
        }

        count++;
        if (count === 1){
            return move
        }else if (count === 2){
            return `${move}2`
        }else{
            return `${move}'`
        }
    }
}

export async function executeMoves(moves, movesSource, map, history, panel=null, animationDuration=0, changeBg=false){
    for (let i = 0; i < moves.length; i++) {
        let move = getMoveParameters(moves[i]);
        addMove(moves[i],
            typeof(movesSource) === "string" ? movesSource : movesSource[i],
            history,
            panel)
        await layerMove(move[0], move[1], map, move[2], animationDuration, changeBg)
    }
}

export async function executeMove(moveName, moveSource, map, history, panel=null, animationDuration=0, changeBg=false){
    let move = getMoveParameters(moveName);
    addMove(moveName, moveSource, history, panel)
    await layerMove(move[0], move[1], map, move[2], animationDuration, changeBg)
}

// export async function name(params) {
    
// }