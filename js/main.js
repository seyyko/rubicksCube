import { layer } from "./layerHandler.js"
import { cubeMap, getPieceByFaceId } from "./cubeMap.js"
import { algorithm } from "./algorithm.js"
import { renderMap } from "./cubeRenderer.js"
import { createMoves } from "./history.js"
import { kingAlgorithm } from "./king.js"

export const history = Array();
export const historyPanel = document.getElementById("history");
export const animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--animation-duration").trim()) * 1000;
const mainCube = document.getElementById("mainCube");

mainCube.appendChild(layer);
createMoves();
renderMap(cubeMap);

export async function doKingAlgorithm(map, history, panel, animationDuration, changeBg){
    await kingAlgorithm(map, history, panel, animationDuration, changeBg);
}

export async function doAlgorithm(map, history, panel, animationDuration, changeBg){
    const h = await algorithm(map, history, panel, animationDuration, changeBg);
    console.clear();
}

window.doKingAlgorithm = doKingAlgorithm;
window.doAlgorithm = doAlgorithm;
window.cm = cubeMap;
window.h = history;
window.p = historyPanel;
window.ad = animationDuration;

// const tests = [
//     getPieceByFaceId("corner", [0, 1, 2], cubeMap),
//     getPieceByFaceId("corner", [0, 1], cubeMap),
//     getPieceByFaceId("corner", [0], cubeMap),
//     getPieceByFaceId("edge"  , [0, 1], cubeMap),
//     getPieceByFaceId("edge"  , [0], cubeMap),
//     getPieceByFaceId("center", [0], cubeMap),
// ]

// console.log(tests)