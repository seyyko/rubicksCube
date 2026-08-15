// matching edges
// matching corners

import { getStickersByCube } from "./cubeMap.js";
import { executeMove, executeMoves } from "./cubeRotation.js";

// get edges (color and pos)
// get center of front right back and left
// do U until 2 edges are correctly placed.

function sortEdgeColor(edgesStickers, crossColor){
    for (let i = 0; i < edgesStickers.length; i++) {
        edgesStickers[i] = edgesStickers[i].filter(
            sticker => sticker.colorId !== crossColor
        )[0];
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

function areEdgesTouching(boolCount){
    if (
        (boolCount[1] && boolCount[2]) ||
        (boolCount[0] && boolCount[3])
    ){
        return false;
    }
    return true;
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

    const edgesCubes = [20, 10, 12, 2]
    const frontEdgeCubesId = 3;

    let upperFaceColor = upperLayer[4].colorId;
    let frontFaceColor = frontLayer[4].colorId;
    let rightFaceColor = rightLayer[4].colorId;
    let leftFaceColor = leftLayer[4].colorId;
    let backFaceColor = backLayer[4].colorId;

    let move;
    let edgesStickers;
    let edgesPlacedData;
    let count;
    let boolCount;
    let edgeTouching;

    edgesStickers = edgesCubes.map(cube => getStickersByCube(map, cube));
    sortEdgeColor(edgesStickers, upperFaceColor);
    edgesPlacedData = howManyEdgePlaced(edgesStickers, 
    [
        backFaceColor,
        leftFaceColor,
        rightFaceColor,
        frontFaceColor
    ]);
    count = edgesPlacedData[0];

    
    console.log("#matchingUpperEdges# how many edges are placed ?", count);

    while (count < 2){
        move = "U";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        
        edgesStickers = edgesCubes.map(cube => getStickersByCube(map, cube));
        sortEdgeColor(edgesStickers, upperFaceColor);
        edgesPlacedData = howManyEdgePlaced(edgesStickers, 
        [
            backFaceColor,
            leftFaceColor,
            rightFaceColor,
            frontFaceColor
        ]);
        count = edgesPlacedData[0];
        console.log("#matchingUpperEdges# (loop) how many edges are placed ?", count);
    }

    if (count === 4){
        return;
    }

    boolCount = edgesPlacedData[1]

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
            
            frontFaceColor = frontLayer[4].colorId;
            rightFaceColor = rightLayer[4].colorId;
            leftFaceColor = leftLayer[4].colorId;
            backFaceColor = backLayer[4].colorId;

            edgesStickers = edgesCubes.map(cube => getStickersByCube(map, cube));
            sortEdgeColor(edgesStickers, upperFaceColor);
            edgesPlacedData = howManyEdgePlaced(edgesStickers, 
            [
                backFaceColor,
                leftFaceColor,
                rightFaceColor,
                frontFaceColor
            ]);

            boolCount = edgesPlacedData[1];
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
            
            frontFaceColor = frontLayer[4].colorId;
            rightFaceColor = rightLayer[4].colorId;
            leftFaceColor = leftLayer[4].colorId;
            backFaceColor = backLayer[4].colorId;

            edgesStickers = edgesCubes.map(cube => getStickersByCube(map, cube));
            sortEdgeColor(edgesStickers, upperFaceColor);
            edgesPlacedData = howManyEdgePlaced(edgesStickers, 
            [
                backFaceColor,
                leftFaceColor,
                rightFaceColor,
                frontFaceColor
            ]);

            boolCount = edgesPlacedData[1];
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
