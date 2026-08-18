// matching edges
// matching corners

import { getStickersByCube } from "./cubeMap.js";
import { executeMove, executeMoves } from "./cubeRotation.js";

// get edges (color and pos)
// get center of front right back and left
// do U until 2 edges are correctly placed.

export function getFacesColors(map) {
    const temp = {};
    const facesName = ["front", "upper", "right", "left", "back", "down"];
    const centerId = 4;
    const botCenterId = [7, 7, 7, 7, 1];
    for (let i = 0; i < 6; i++) {
        temp[`${facesName[i]}Center`] = map[i][centerId].colorId
        if (botCenterId[i]){
            temp[`${facesName[i]}BotCenter`] = map[i][botCenterId[i]].colorId
        }
    }
    return temp
}

function sortEdgeColor(edgesStickers, crossColor){
    for (let i = 0; i < edgesStickers.length; i++) {
        edgesStickers[i] = edgesStickers[i].filter(
            sticker => sticker.colorId !== crossColor
        )[0];
    }
}

function sortCornerColor(cornersSticker, crossColor){
    for (let i = 0; i < cornersSticker.length; i++) {
        cornersSticker[i] = cornersSticker[i].filter(
            sticker => sticker.colorId !== crossColor
        );
    }
}

function howManyEdgePlaced(edgeStickers, faces){
    let count = 0;
    let boolCount = Array();
    for (let i = 0; i < 4; i++) {
        if (edgeStickers[i].colorId === faces[i]) count++;
        boolCount.push(edgeStickers[i].colorId === faces[i]);
    }
    return [count, boolCount];
}

function howManyCornerPlaced(cornersStickers, faces){
    let count = 0;
    let boolCount = Array();
    for (let i = 0; i < 4; i++) {
        if (
            faces[i].includes(cornersStickers[i][0].colorId) &&
            faces[i].includes(cornersStickers[i][1].colorId)
        ){
            count++
        }
        boolCount.push(
            faces[i].includes(cornersStickers[i][0].colorId) &&
            faces[i].includes(cornersStickers[i][1].colorId)
        );
    }
    return [count, boolCount];
}

function areEdgesTouching(boolCount){
    if (
        (boolCount[1] && boolCount[2]) ||
        (boolCount[0] && boolCount[3])
    ){
        return false;
    }
    return true;
}

function getEdgeData(map, edgesCube, target) {
    const facesColors = getFacesColors(map);

    const edgesStickers = edgesCube.map(
        cube => getStickersByCube(map, cube)
    );

    sortEdgeColor(edgesStickers, target);

    return howManyEdgePlaced(edgesStickers, [
        facesColors.backCenter,
        facesColors.leftCenter,
        facesColors.rightCenter,
        facesColors.frontCenter
    ]);
}

function getCornerData(map, cornersCube, target, faces) {
    const facesColors = getFacesColors(map);

    const cornersStickers = cornersCube.map(
        corner => getStickersByCube(map, corner)
    );

    sortCornerColor(cornersStickers, target);

    const colors = faces.map(face => face.map(name => facesColors[name]));

    return howManyCornerPlaced(cornersStickers, colors);
}

export async function matchingUpperEdges(map, history, panel=null, animationDuration=0, changeBg=false){
    // algorithm : R U R' U R U'2 R'
    // turn the upper face until 2 colors are correctly placed.
    // 2 cases:
    // 2 colors are touching -> turn the cube until one is on the right face and the other on the back face.
    // then do algortihm.
    // 2 colors aren't touching (on opposite faces) -> turn the cube until one of the color is on the front face.
    // then do algorithm + y' + algorithm again.
    // finish with U.
    
    const upperLayer = map[1];
    const frontLayer = map[0];
    const rightLayer = map[2];
    const leftLayer = map[3];
    const backLayer = map[4];

    const edgesCube = [20, 10, 12, 2]
    const frontEdgeCubesId = 3;

    let facesColors = getFacesColors(map);
    let move;
    let count;
    let boolCount;
    let edgeTouching;

    [count, boolCount] = getEdgeData(map, edgesCube, facesColors.upperCenter);
    
    console.log("#matchingUpperEdges# how many edges are placed ?", count);

    while (count < 2){
        move = "U";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        
        facesColors = getFacesColors(map);
        [count, boolCount] = getEdgeData(map, edgesCube, facesColors.upperCenter);
        console.log("#matchingUpperEdges# (loop) how many edges are placed ?", count);
    }

    // all edges are already correctly placed.
    if (count === 4){
        return;
    }

    facesColors = getFacesColors(map);
    [count, boolCount] = getEdgeData(map, edgesCube, facesColors.upperCenter);

    console.log("#matchingUpperEdges# final count (should be 2):", count);
    console.log("#matchingUpperEdges# boolCount (array):", boolCount);

    edgeTouching = areEdgesTouching(boolCount);

    console.log("#matchingUpperEdges# edges are touching ?", edgeTouching);

    if (!edgeTouching){
        console.log("#matchingUpperEdges# repeat 'y' until edges are correctly placed.");
        while(
            !(boolCount[frontEdgeCubesId])
        ){
            move = "y";
            await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);

                facesColors = getFacesColors(map);
                [count, boolCount] = getEdgeData(map, edgesCube, facesColors.upperCenter);
        }
        console.log("#matchingUpperEdges# edges are correctly placed.");
        console.log("#matchingUpperEdges# do: algorithm + y' + algorithm again.");
        move = ["R", "U", "R'", "U", "R", "U'2", "R'", "y'", "R", "U", "R'", "U", "R", "U'2", "R'"];
        await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
    }else{
        console.log("#matchingUpperEdges# repeat 'y' until edges are correctly placed.");
        while(
            !(boolCount[0] && boolCount[2])
        ){
            move = "y";
            await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);

            facesColors = getFacesColors(map);
            [count, boolCount] = getEdgeData(map, edgesCube, facesColors.upperCenter);
        }
        console.log("#matchingUpperEdges# edges are correctly placed.");
        console.log("#matchingUpperEdges# do: algorithm");
        move = ["R", "U", "R'", "U", "R", "U'2", "R'"];
        await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
    }

    console.log("#matchingUpperEdges# finish with 'U'.");
    move = "U";
    await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
}


export async function matchingUpperCorners(map, history, panel=null, animationDuration=0, changeBg=false){
    // algorithm : L' U R U' L U R' U'
    // do 'y' 4 times,
    // each time see if the corner between the front and right face
    // is correctly placed.
    // 2 case:
    // none are correctly placed -> do algorithm on any face (create a corner).
    // at least one is correctly placed -> do the algorithm while the corner is between the front and right face.
    
    const upperLayer = map[1];
    const frontLayer = map[0];
    const rightLayer = map[2];
    const leftLayer = map[3];
    const backLayer = map[4];
    const cornersCube = [3, 21, 19, 1];
    const facesOrder = [
        ["frontCenter", "rightCenter"],
        ["rightCenter", "backCenter"],
        ["backCenter", "leftCenter"],
        ["leftCenter", "frontCenter"]
    ];

    let facesColors = getFacesColors(map);
    let move;
    let count;
    let boolCount;

    [count, boolCount] = getCornerData(map, cornersCube, facesColors.upperCenter, facesOrder);

    console.log("#matchingUpperCorner# how many corner are correctly placed ?", count);
    console.log("#matchingUpperCorner# boolean list of those corners:", boolCount);
    while (count < 4){
        console.log("#matchingUpperCorner# (in loop) is there at least one corner correctly placed ?", count > 0);
        if (count){
            console.log("#matchingUpperCorner# do 'y' until the corner is between the front and right faces.");
            while (!boolCount[0]){
                move = "y";
                await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                
                facesColors = getFacesColors(map);
                [count, boolCount] = getCornerData(map, cornersCube, facesColors.upperCenter, facesOrder);
            }
            console.log("#matchingUpperCorner# corner is correctly placed.");
            console.log("#matchingUpperCorner# execute the algorithm.");
            move = ["L'", "U", "R", "U'", "L", "U", "R'", "U'"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            
            facesColors = getFacesColors(map);
            [count, boolCount] = getCornerData(map, cornersCube, facesColors.upperCenter, facesOrder);
        }else{
            console.log("#matchingUpperCorner# no corner are correctly placed, then do the algorithm (to create a corner).");
            move = ["L'", "U", "R", "U'", "L", "U", "R'", "U'"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            
            facesColors = getFacesColors(map);
            [count, boolCount] = getCornerData(map, cornersCube, facesColors.upperCenter, facesOrder);
        }
    }
    console.log("#matchingUpperCorner# finish with 'x2' to turn the cube.");
    move = "x2";
    await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
}