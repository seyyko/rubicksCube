// 2. LBL:
// We assume the bottom face already has a completed cross.
// First, we look for a corner containing the colors of the front, right, and bottom faces.
//
// If the corner is in the bottom layer:
// - If it is already correctly positioned and oriented, we leave it untouched.
// - If it is correctly positioned but incorrectly oriented, we perform the Sexy Move until it is oriented correctly.
// - Otherwise, we bring it to the upper layer and insert it into the correct position.
//
// We repeat this process for all four corners.
//
// EDGE PARKING :
// Once the first layer is completed, we focus on the edges.
// We rotate the cube and, at each rotation, check whether the right edge
// of the front face contains an edge piece that does NOT have the upper-face color.
//
// If it does, we move that edge to the upper layer without disturbing any of the
// already solved corners.
//
// The upper layer has four edge slots. A slot is considered empty when it contains
// an edge piece with the upper-face color.
//
// To insert an edge into the upper layer:
// - The edge must be located between the front and right faces.
//   (Since we check this condition at each cube rotation, this should already be true.)
// - Slot #2 on the upper face must be empty.
//   If it is not, simply rotate the upper face until slot #2 becomes empty.
//
// Example configuration:
// Front face (edge)
// [ ] [ ] [ ]
// [ ] [ ] [e]
// [ ] [ ] [ ]
// Right face (edge)
// [ ] [ ] [ ]
// [e] [ ] [ ]
// [ ] [ ] [ ]
// Upper face (slots)
// [ ] [1] [ ]
// [2] [ ] [3]
// [ ] [4] [ ]

import { getFacesColors } from "./algoMatchingUpperPieces.js";
import { getFacesByCube, getPieceByFaceId } from "./cubeMap.js";
import { executeMoves, executeMove, getOptimalMove } from "./cubeRotation.js";
import { layers, layerToFace } from "./layerHandler.js";

// The goal is to fill all four edge slots in the upper layer.
// Once all required edges have been moved there, they can be paired
// and inserted into their corresponding corner positions using the
// standard beginner F2L method.
//
// After all edge-corner pairs are inserted correctly,
// the F2L is complete.

// Sexy move : R U R' U'

export function getSlotState(map, target){
    let temp = Array();
    let slotsColors = [
        [map[1][1].colorId, map[4][7].colorId],
        [map[1][3].colorId, map[3][1].colorId],
        [map[1][5].colorId, map[2][1].colorId],
        [map[1][7].colorId, map[0][1].colorId]
    ]
    for (let i = 0; i < slotsColors.length; i++) {
        temp.push(slotsColors[i].includes(target))
    }
    return temp;
}

export async function invertedTCase(map, history, panel=null, animationDuration=0, changeBg=false){
    for (let i = 0; i < 4; i++) {
        let facesColors = getFacesColors(map);
        let corner;
        let cornerCube;
        let cornerFaces;

        let move;
        let moveOrder;
        let upperCornerSticker;
        let downCornerSticker;
        let loop;

        corner = getPieceByFaceId(
            "corner",
            [
                facesColors.frontCenter,
                facesColors.rightCenter,
                facesColors.downCenter,
            ],
            map);
        cornerCube = Number(Object.keys(corner)[0]);
        cornerFaces = getFacesByCube(cornerCube);

        console.log("#invertedTCase# corner is on the bottom layer ?", cornerFaces.includes(layerToFace["downLayer"]));
        if(cornerFaces.includes(layerToFace["downLayer"])){
            if(cornerFaces.includes(layerToFace["frontLayer"])){
                console.log("#invertedTCase# corner contain the front face.");
                moveOrder = [
                    ["R", "U", "R'", "U'"],
                    ["L'", "U'", "L", "U"],
                ];
            }else{
                console.log("#invertedTCase# corner contain the back face.");
                moveOrder = [
                    ["R'", "U'", "R", "U"],
                    ["L", "U", "L'", "U'"],
                ];
            }
            if(cornerFaces.includes(layerToFace["rightLayer"])){
                console.log("#invertedTCase# corner contain the right face.");
                move = moveOrder[0];
            }else{
                console.log("#invertedTCase# corner contain the left face.");
                move = moveOrder[1];
            }
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            facesColors = getFacesColors(map);
        }

        corner = getPieceByFaceId(
            "corner",
            [
                facesColors.frontCenter,
                facesColors.rightCenter,
                facesColors.downCenter,
            ],
            map);
        cornerCube = Number(Object.keys(corner)[0]);
        cornerFaces = getFacesByCube(cornerCube);
        
        // once on the upper face, we move it until it's between the front, right and upper faces.
        console.log("#invertedTCase# once all corners are on the upper face, we move the upper face until the top right corner fit.");
        move = getOptimalMove("upperLayer", "corner", cornerCube, 3);
        if (move.length > 0){
            await executeMove(move, "solver", map, history, panel, animationDuration, changeBg)
            facesColors = getFacesColors(map);
        }

        // now that he's correctly placed on the upper face, we need to repeat
        // the Sexy move until he is correctly placed on the bottom face.
        // without optimisation it's max 5 moves (the pattern return to it's original place every 6 movements)
        // with optimisation it's only 1 or 3 (2/3 chances of doing 1 movement, 1/3 of doing 3).

        upperCornerSticker = facesColors.upperCornerDownRight;
        if(upperCornerSticker === facesColors.frontCenter){
            console.log("#invertedTCase# the upper sticker of the corner is the front face color.");
            move = ["U", "R", "U'", "R'"]
            loop = 1;
        }else if(upperCornerSticker === facesColors.rightCenter){
            console.log("#invertedTCase# the upper sticker of the corner is the right face color.");
            move = ["R", "U", "R'", "U'"]
            loop = 1;
        }else{
            console.log("#invertedTCase# the upper sticker of the corner is the down face color.");
            move = ["R", "U", "R'", "U'"]
            loop = 3;
        }

        for (let j = 0; j < loop; j++) {
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg)
            facesColors = getFacesColors(map);
        }

        console.log("#invertedTCase# once the corner is placed we move the cube 'y'.");
        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
    }
}

export async function edgeParking(map, history, panel=null, animationDuration=0, changeBg=false) {
    for (let i = 0; i < 4; i++) {
        let facesColors = getFacesColors(map);
        let boolEdgeSlots = getSlotState(map, facesColors.upperCenter);

        let move;
        let running = true;
        let edgeColors = [
                facesColors.frontEdgeRight,
                facesColors.rightEdgeLeft,
            ]

        if (
            boolEdgeSlots.includes(true)                        // upper face has empty slot.
            && !(edgeColors.includes(facesColors.upperCenter))  // edge isn't a empty slot.
            && !(
                edgeColors.includes(facesColors.frontCenter)    // edge isn't already correctly placed.
                && edgeColors.includes(facesColors.rightCenter)
                && facesColors.frontEdgeRight === facesColors.frontCenter
            )
        ){
            console.log("#edgeParking# upper face has empty slot AND the edge isn't an empty slot AND the edge isn't already correctly placed.");
            // right edge of the front face doesn't have upper face center color (we have to move it).
            // turn the upper face till the 2nd slot is empty.
            while (running){
                if (boolEdgeSlots[1]){ // 2nd slot.
                    running = false;
                    break;
                }
                console.log("#edgeParking# we move the upper face until the 2nd slot is empty.");
                await executeMove("U", "solver", map, history, panel, animationDuration, changeBg);
                facesColors = getFacesColors(map);
                boolEdgeSlots = getSlotState(map, facesColors.upperCenter);
            }
            // slot2 is empty, now we put the edge on the upper face.
            console.log("#edgeParking# once the 2nd slot is empty we do the algorithm.");
            move = ["R", "U'", "R'", "U'", "F'", "U", "F"]
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            facesColors = getFacesColors(map);
        }
        console.log("#edgeParking# and we finally rotate the cube 'y'.");
        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
    }

    for (let i = 0; i < 4; i++) {
        let facesColors = getFacesColors(map);

        const upperLayerEdgesColors = {
            20: facesColors.upperEdgeUpper,
            10: facesColors.upperEdgeLeft,
            12: facesColors.upperEdgeRight,
            2: facesColors.upperEdgeDown,
        };
        const upperLayerCubes = layers[4].grid.map(str => parseInt(str.slice(1)));

        let move;
        let edge;
        let edgeCube;
        let edgeColors;
        let edgeUpperColor;
        let target;

        console.log("#edgeParking# 2nd step after placing all edge on the top face:");
        edge = getPieceByFaceId("edge", [facesColors.frontCenter, facesColors.rightCenter], map);
        edgeCube = Number(Object.keys(edge)[0]);

        console.log("#edgeParking# we find the edge that has the color of the front and right faces.");
        console.log("#edgeParking# once we find it, we need to know if it is on the upper edge or not");
        console.log("#edgeParking# is the edge on the upper face (does it need to be placed or not) ?", upperLayerCubes.includes(edgeCube));
        if (upperLayerCubes.includes(edgeCube)){
            edgeColors = [
                edge[edgeCube][0].colorId,
                edge[edgeCube][1].colorId
            ];
            edgeUpperColor = upperLayerEdgesColors[edgeCube];

            target = edgeUpperColor === facesColors.frontCenter ? 12 : 2;
            move = getOptimalMove("upperLayer", "edge", edgeCube, target);
            if (move.length > 0){
                await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                facesColors = getFacesColors(map);
            }
            console.log("#edgeParking# if that's the case then, we rotate the upper face until the edge is aligned with the face.");
            console.log("#edgeParking# then do the algorithm.");
            move = target === 12 ? ["U'", "F'", "U", "F", "U", "R", "U'", "R'"] : ["U", "R", "U'", "R'", "U'", "F'", "U", "F"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            facesColors = getFacesColors(map);
        }

        console.log("#edgeParking# and we finally rotate the cube 'y' (all edge should be placed).");
        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
    }
}