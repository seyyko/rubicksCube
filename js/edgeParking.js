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

import { getFacesByCube, getPieceByFaceId } from "./cubeMap.js";
import { executeMoves, executeMove, getOptimalMove } from "./cubeRotation.js";
import { faceToLayer, layers, layerToFace } from "./layerHandler.js";

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
        [map[1][1].faceId, map[4][7].faceId],
        [map[1][3].faceId, map[3][1].faceId],
        [map[1][5].faceId, map[2][1].faceId],
        [map[1][7].faceId, map[0][1].faceId]
    ]
    for (let i = 0; i < slotsColors.length; i++) {
        temp.push(slotsColors[i].includes(target))
    }
    return temp;
}

export async function invertedTCase(map, history, panel=null, animationDuration=0, changeBg=false){
    for (let i = 0; i < 4; i++) {
        const upperLayer = map[1]
        const frontCenter = map[0][4]
        const upperCenter = map[1][4]
        const rightCenter  = map[2][4]
        const downCenter = map[5][4]
        const frontFace = getFacesByCube(frontCenter.cube)[0];
        const upperFace = getFacesByCube(upperCenter.cube)[0];
        const rightFace  = getFacesByCube(rightCenter.cube)[0];
        const downFace = getFacesByCube(downCenter.cube)[0];
    
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
                frontCenter.faceId,
                rightCenter.faceId,
                downCenter.faceId,
            ],
            map);
        cornerCube = Number(Object.keys(corner)[0]);
        cornerFaces = getFacesByCube(cornerCube);

        // if the corner is on the bottom layer :
        if(cornerFaces.includes(layerToFace["downLayer"])){
            if(cornerFaces.includes(layerToFace["frontLayer"])){
                // the corner contain the front face,
                moveOrder = [
                    ["R", "U", "R'", "U'"],
                    ["L'", "U'", "L", "U"],
                ];
            }else{
                // the corner contain the back face,
                moveOrder = [
                    ["R'", "U'", "R", "U"],
                    ["L", "U", "L'", "U'"],
                ];
            }
            if(cornerFaces.includes(layerToFace["rightLayer"])){
                // the corner contain the right face,
                move = moveOrder[0];
            }else{
                // the corner contain the left face,
                move = moveOrder[1];
            }
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg)
        }

        corner = getPieceByFaceId(
            "corner",
            [
                frontCenter.faceId,
                rightCenter.faceId,
                downCenter.faceId,
            ],
            map);
        cornerCube = Number(Object.keys(corner)[0]);
        cornerFaces = getFacesByCube(cornerCube);
        
        // once on the upper face, we move it until it's between the front, right and upper faces.
        move = getOptimalMove("upperLayer", "corner", cornerCube, 3);
        if (move.length > 0){
            await executeMove(move, "solver", map, history, panel, animationDuration, changeBg)
        }

        // now that he's correctly placed on the upper face, we need to repeat
        // the Sexy move until he is correctly placed on the bottom face.
        // without optimisation it's max 5 moves (the pattern return to it's original place every 6 movements)
        // with optimisation it's only 1 or 3 (2/3 chances of doing 1 movement, 1/3 of doing 3).

        upperCornerSticker = upperLayer[8].faceId;
        if(upperCornerSticker === frontCenter.faceId){
            move = ["U", "R", "U'", "R'"]
            loop = 1;
        }else if(upperCornerSticker === rightCenter.faceId){
            move = ["R", "U", "R'", "U'"]
            loop = 1;
        }else{
            move = ["R", "U", "R'", "U'"]
            loop = 3;
        }

        for (let j = 0; j < loop; j++) {
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg)
        }

        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
    }
}

export async function edgeParking(map, history, panel=null, animationDuration=0, changeBg=false) {
    for (let i = 0; i < 4; i++) {
        const frontLayer =  map[0]
        const upperLayer =  map[1]
        const rightLayer =  map[2]
        const frontCenter = map[0][4]
        const upperCenter = map[1][4]
        const rightCenter  = map[2][4]
        const frontFace = getFacesByCube(frontCenter.cube)[0];
        const upperFace = getFacesByCube(upperCenter.cube)[0];
        const rightFace  = getFacesByCube(rightCenter.cube)[0];

        let move;
        let boolEdgeSlots = getSlotState(map, upperLayer[4].faceId);
        let running = true;
        let edgeColors = [
                frontLayer[5].faceId,
                rightLayer[3].faceId,
            ]

        if (
            boolEdgeSlots.includes(true)                    // upper face has empty slot.
            && !(edgeColors.includes(upperLayer[4].faceId)) // edge isn't a empty slot.
            && !(
                edgeColors.includes(frontLayer[4].faceId)   // edge isn't already correctly placed.
                && edgeColors.includes(rightLayer[4].faceId)
                && frontLayer[5].faceId === frontCenter.faceId
            )
        ){
            // right edge of the front face doesn't have upper face center color (we have to move it).
            // turn the upper face till the 2nd slot is empty.
            while (running){
                if (boolEdgeSlots[1]){ // 2nd slot.
                    running = false;
                    break;
                }
                await executeMove("U", "solver", map, history, panel, animationDuration, changeBg);
                boolEdgeSlots = getSlotState(map, upperCenter.faceId);
            }
            // slot2 is empty, now we put the edge on the upper face.
            move = ["R", "U'", "R'", "U'", "F'", "U", "F"]
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
        }
        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
    }

    for (let i = 0; i < 4; i++) {
        const upperLayer = map[1];
        const frontCenter = map[0][4]
        const upperCenter = map[1][4]
        const rightCenter  = map[2][4]
        const frontFace = getFacesByCube(frontCenter.cube)[0];
        const upperFace = getFacesByCube(upperCenter.cube)[0];
        const rightFace  = getFacesByCube(rightCenter.cube)[0];
        const upperLayerEdgesColors = {
            20: upperLayer[1].faceId,
            10: upperLayer[3].faceId,
            12: upperLayer[5].faceId,
            2: upperLayer[7].faceId,
        };
        const upperLayerCubes = layers[4].grid.map(str => parseInt(str.slice(1)))
        let move;
        let edge;
        let edgeCube;
        let edgeColors;
        let edgeUpperColor;
        let target;

        // find the edge that has the front center and right center color.
        edge = getPieceByFaceId("edge", [frontCenter.faceId, rightCenter.faceId], map);
        edgeCube = Number(Object.keys(edge)[0]);
        if (upperLayerCubes.includes(edgeCube)){
            // if the edge is on the upper face.
            edgeColors = [
                edge[edgeCube][0].faceId,
                edge[edgeCube][1].faceId
            ];
            edgeUpperColor = upperLayerEdgesColors[edgeCube];

            target = edgeUpperColor === frontCenter.faceId ? 12 : 2;
            move = getOptimalMove("upperLayer", "edge", edgeCube, target);
            if (move.length > 0){
                await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
            }
            move = target === 12 ? ["U'", "F'", "U", "F", "U", "R", "U'", "R'"] : ["U", "R", "U'", "R'", "U'", "F'", "U", "F"];
            await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
        }

        move = "y";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
    }
}