import { getFacesColors } from "./algoMatchingUpperPieces.js";
import { getStickersByCube } from "./cubeMap.js";
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
    
    const frontLayer = map[0];
    const rightLayer = map[2];
    const leftLayer = map[3];
    const backLayer = map[4];
    const downLayer = map[5];
    const cornersCube = [9, 27, 25, 7];

    let facesColors = getFacesColors(map);
    let move;
    let corners;
    let count;

    console.log("testouille1:");
    corners = cornersCube.map(cube => isCornerPlaced(map, cube, 5, facesColors.downCenter))
    count = corners.filter(Boolean).length;
    console.log("testouille2:", corners, count);

    while (count < 4){
        console.log("testouille: combien bien placé ?", count)
        console.log("testouille: coin bien placé ?", corners[0])
        if (!corners[0]){
            if (getAlgoDirection(map,facesColors.downCenter)){
                console.log("testouille: le sticker de la couleur du bas est a droite.");
                move = ["R", "U", "R'", "U'", "R", "U", "R'", "U'"];
            }else{
                console.log("testouille: le sticker de la couleur du bas est a gauche.");
                move = ["U", "R", "U'", "R'", "U", "R", "U'", "R'"];
            }
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
        }
        console.log("testouille: on execute D' et on recommence.");
        move = "D'";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        
        facesColors = getFacesColors(map);
        corners = cornersCube.map(cube => isCornerPlaced(map, cube, 5, facesColors.downCenter))
        count = corners.filter(Boolean).length;
    }

    console.log("testouille: on finis par tourner la face du bas jusqu'à l'alignement.");

    while (
        !(facesColors.frontBotCenter === facesColors.frontCenter)
    )
    {
        console.log("testouille: aligné ?", facesColors.frontBotCenter === facesColors.frontCenter);
        move = "D"
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
    }
    
    console.log("testouille: cube résolut !!!");
}