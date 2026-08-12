// 2. LBL:
// We assume the bottom face already has a completed cross.
// First, we look for a corner containing the colors of the front, right, and bottom faces.
//
// If the corner is in the bottom layer:
// - If it is already correctly positioned and oriented, we leave it untouched.
// - If it is correctly positioned but incorrectly oriented, we perform the Sexy Move until it is oriented correctly.
// - Otherwise, we bring it to the top layer and insert it into the correct position.
//
// We repeat this process for all four corners.
//
// EDGE PARKING :
// Once the first layer is completed, we focus on the edges.
// We rotate the cube and, at each rotation, check whether the right edge
// of the front face contains an edge piece that does NOT have the top-face color.
//
// If it does, we move that edge to the top layer without disturbing any of the
// already solved corners.
//
// The top layer has four edge slots. A slot is considered empty when it contains
// an edge piece with the top-face color.
//
// To insert an edge into the top layer:
// - The edge must be located between the front and right faces.
//   (Since we check this condition at each cube rotation, this should already be true.)
// - Slot #2 on the top face must be empty.
//   If it is not, simply rotate the top face until slot #2 becomes empty.
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

// The goal is to fill all four edge slots in the top layer.
// Once all required edges have been moved there, they can be paired
// and inserted into their corresponding corner positions using the
// standard beginner F2L method.
//
// After all edge-corner pairs are inserted correctly,
// the F2L is complete.

// Sexy move : R U R' U'

export async function invertedTCase(map, history, panel=null, animationDuration=0, changeBg=false){
    for (let i = 0; i < 4; i++) {
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
        if(cornerFaces.includes(5)){
            if(cornerFaces.includes(0)){
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
            if(cornerFaces.includes(2)){
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
        
        // once on the top face, we move it until it's between the front, right and upper faces.
        move = getOptimalMove("upperLayer", "corner", cornerCube, 3);
        if (move.length > 0){
            await executeMove(move, "solver", map, history, panel, animationDuration, changeBg)
        }

        // now that he's correctly placed on the top face, we need to repeat
        // the Sexy move until he is correctly placed on the bottom face.
        // without optimisation it's max 5 moves (the pattern return to it's original place every 6 movements)
        // with optimisation it's only 1 or 3 (2/3 chances of doing 1 movement, 1/3 of doing 3).

        upperCornerSticker = map[1][8].faceId;
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