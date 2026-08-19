// cases:
// center doesn't have neightbor,
// center have 2 neigbors in a straight line (aligned),
// center have 2 neigbors in a L shape (not aligned),

import { getFacesColors } from "./algoMatchingUpperPieces.js";
import { executeMove, executeMoves } from "./cubeRotation.js";

function getNeighbors(face, centerFaceId){
    const neighbors = [
        face[1].colorId, 
        face[3].colorId, 
        face[5].colorId, 
        face[7].colorId];
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
    let facesColors = getFacesColors(map);
    
    let move;
    let neighbors = getNeighbors(upperLayer, facesColors.upperCenter);
    let neighborsCount = countNeighbors(neighbors);

    while (!(neighborsCount === 4)){
        console.log("#upperCross# neighborsCount", neighborsCount);
        if (neighborsCount === 0){
            console.log("#upperCross# 0 neighbor (only the center)")
            move = ["F", "R", "U", "R'", "U'", "F'", "y2"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            facesColors = getFacesColors(map);
        }else{
            console.log("#upperCross# 2 neighbor (either L shape or straight line)")
            console.log("#upperCross# neighbors are aligned?", isNeighborsAlined(upperLayer, facesColors.upperCenter))
            if (isNeighborsAlined(upperLayer, facesColors.upperCenter)) {
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
                facesColors = getFacesColors(map);
                
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
                facesColors = getFacesColors(map);
            }
        }
        console.log("#upperCross# finish with getting updating the neighbors");
        neighbors = getNeighbors(upperLayer, facesColors.upperCenter);
        neighborsCount = countNeighbors(neighbors);
        facesColors = getFacesColors(map);
    }
}
