import { getFacesColors } from "./algoMatchingUpperPieces.js";
import { executeMove, executeMoves } from "./cubeRotation.js";


function isCornerPlaced(map, cornerCube, faceId, colorId){
    for (let i = 0; i < map[faceId].length; i++) {
        if (map[faceId][i].cube === cornerCube){
            return map[faceId][i].colorId === colorId;
        }
    }
}

function getAlgoDirection(map, crossColor){
    const cornerRightColor = map[2][6].colorId;
    return cornerRightColor === crossColor;
}

export async function finalMove(map, history, panel=null, animationDuration=0, changeBg=false){
    // algorithm: R U R' U'
    // reversed: U R U' R'
    const cornersCube = [9, 27, 25, 7];

    let facesColors = getFacesColors(map);
    let move;
    let corners;
    let count;

    corners = cornersCube.map(cube => isCornerPlaced(map, cube, 5, facesColors.downCenter))
    count = corners.filter(Boolean).length;
    console.log("#finalMoveSet# corners list:", corners);

    while (count < 4){
        console.log("#finalMoveSet# how many corners are in good position ?", count)
        console.log("#finalMoveSet# is the current corner is in good position ?", corners[0])
        if (!corners[0]){
            console.log("#finalMoveSet# the current corner isn't in a good position.");
            if (getAlgoDirection(map,facesColors.downCenter)){
                console.log("#finalMoveSet# sticker that contain the down face color is on the right.");
                console.log("#finalMoveSet# the algorithm is 2 Sexy move (R U R' U').");
                move = ["R", "U", "R'", "U'", "R", "U", "R'", "U'"];
            }else{
                console.log("#finalMoveSet# sticker that contain the down face color is on the left.");
                console.log("#finalMoveSet# the algorithm is 2 reversed Sexy move (U R U' R').");
                move = ["U", "R", "U'", "R'", "U", "R", "U'", "R'"];
            }
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
        }
        console.log("#finalMoveSet# do D' then, we check the next corner.");
        move = "D'";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        
        facesColors = getFacesColors(map);
        corners = cornersCube.map(cube => isCornerPlaced(map, cube, 5, facesColors.downCenter))
        count = corners.filter(Boolean).length;
        console.log("#finalMoveSet# corners list:", corners);
    }

    console.log("#finalMoveSet# we finish by turning the down face until the cube is done.");

    while (
        !(facesColors.frontEdgeDown === facesColors.frontCenter)
    )
    {
        console.log("#finalMoveSet# down face aligned ?", facesColors.frontEdgeDown === facesColors.frontCenter);
        move = "D"
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
    }
    
    console.log("#finalMoveSet# cube is resolved !!!");
}