// cases:
// center doesn't have neightbor,
// center have 2 neigbors in a straight line,
// center have 2 neigbors in a L shape,

import { getSlotState } from "./algoEdgeParking.js";
import { executeMove, executeMoves } from "./cubeRotation.js";

function getNeighbors(face, centerFaceId){
    const neighbors = [
        face[1].faceId, 
        face[3].faceId, 
        face[5].faceId, 
        face[7].faceId];
    return neighbors.map(color => centerFaceId === color);
}

function countNeighbors(neighbors){
    let neighborsCount = 0;
    for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i]) neighborsCount++;
    }
    return neighborsCount;
}

function isNeighborsAlined(face, centerFaceId){
    const neighbors = getNeighbors(face, centerFaceId);
    const neighborsCount = getNeighbors(face, centerFaceId);
    if (neighborsCount < 2) return;
    if (
        neighbors[0] && neighbors[3]
        || neighbors[1] && neighbors[2]
    ){
        return true;
    }else{
        return false;
    }
}

export async function upperCross(map, history, panel=null, animationDuration=0, changeBg=false){
    const upperLayer = map[1];
    const upperCenter = upperLayer[4];
    const upperCenterColor = upperCenter.faceId;
    let move;
    let neighbors = getNeighbors(upperLayer, upperCenterColor);
    let neighborsCount = countNeighbors(neighbors);

    while (!(neighborsCount === 4)){
        console.log("#upperCross# neighborsCount", neighborsCount);
        if (neighborsCount === 0){
            console.log("#upperCross# 0 neighbor (only the center)")
            move = ["F", "R", "U", "R'", "U'", "F'", "y2"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
        }else{
            console.log("#upperCross# 2 neighbor (either L shape or straight line)")
            console.log("#upperCross# neighbors are aligned?", isNeighborsAlined(upperLayer, upperCenterColor))
            if (isNeighborsAlined(upperLayer, upperCenterColor)) {
                if (
                    neighbors[0]
                    && neighbors[3]
                ){
                    console.log("#upperCross# neighbors are aligned but in the wrong direction");
                    move = "U";
                    await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                }
                console.log("#upperCross# neighbors are correctly aligned");
                move = ["F", "R", "U", "R'", "U'", "F'"];
                await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
                
            }else{
                if(
                    neighbors[0]
                    && neighbors[1]
                ){
                    console.log("#upperCross# neighbors are in a L shape (correct direction)");
                    move = ["F", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "F'"];
                    await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
                }else{
                    console.log("#upperCross# neighbors are in a L shape (wrong direction)");
                    move = "U";
                    await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                }
            }
        }
        console.log("#upperCross# finish with getting updating the neighbors");
        neighbors = getNeighbors(upperLayer, upperCenterColor);
        neighborsCount = countNeighbors(neighbors);
    }
}
