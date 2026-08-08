import { layer } from "./layerHandler.js"
import { cubeMap, getPieceByFaceId } from "./cubeMap.js"
import { setCross } from "./algorithm.js"
import { renderMap } from "./cubeRenderer.js"
import { createMoves } from "./history.js"
import { kingAlgorithm } from "./king.js"

export const history = Array();
export const historyPanel = document.getElementById("history");
const mainCube = document.getElementById("mainCube");
export const animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--animation-duration").trim()) * 1000;

mainCube.appendChild(layer);

createMoves();

renderMap(cubeMap);

export function doKingAlgorithm(map, history, panel, animationDuration, changeBg){
    kingAlgorithm(map, history, panel, animationDuration, changeBg);
}

export function doSetCross(){
    setCross();
}

window.doKingAlgorithm = doKingAlgorithm;
window.doSetCross = doSetCross;
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