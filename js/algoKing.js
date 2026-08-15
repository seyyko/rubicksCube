import { getPieceByFaceId, getFacesByCube } from "./cubeMap.js";
import { getOptimalMove, executeMoves, executeMove } from "./cubeRotation.js";
import { moves } from "./history.js";
import { faceToLayer, layerToFace } from "./layerHandler.js";
import { wait } from "./shuffle.js";

// KING algorithm
//
// Faces are kingdoms. Centers and edges are lands.
// The front, upper, and back faces are considered neighbors.
// The remaining faces are foreign kingdoms.
//
// An edge contains 2 colors, therefore it appears between
// EXACTLY 2 faces.
//
// Even though an edge is located between 2 faces, it belongs
// to only one kingdom. We call KING the face where the edge
// appears while its sticker color does NOT match the center
// color of the cross.
// CASES 1 - 3 (the edge is on a neighboring face)
// CASE 1
// The edge is on the front face.
//
// If the other face is foreign:
//   ROTATE the foreign face twice, then go to CASE 3.
// Else if the front face is the KING of this edge:
//   Go to CASE 2.
// Else:
//   DO NOTHING (the edge is already correctly placed).
// CASE 2
// The edge is on the upper face.
//
// If the upper face is the KING of this edge:
//   REPEAT U until the edge is located between
//   the upper and front faces.
// Else:
//   REPEAT U until the edge is located between
//   the upper and back faces, then go to CASE 3.
// CASE 3
// The edge is on the back face.
//
// If the back face is the KING of this edge:
//   REPEAT B until the edge is located between
//   the upper and back faces, then execute:
//   B L U' L'
// Else:
//   REPEAT B until the edge is located between
//   the upper and back faces, then go to CASE 2.
// CASE 4
// The edge is located between two foreign faces.
//
// Execute:
//   D' B' D (if the edge is between the left and down faces)
// or
//   D B D' (if the edge is between the right and down faces)
//
// Then go to CASE 3.
// When the edge is correctly placed:
//   Execute z'
//   Then REPEAT the KING Algorithm.

function whoIsKing(map, edgeFaces, edgeCube, frontCenter){
    let king;
    for (let i = 0; i < map[edgeFaces[0]].length; i++) {
        if (map[edgeFaces[0]][i].cube === edgeCube){
            if (map[edgeFaces[0]][i].colorId === frontCenter.colorId){
                king = edgeFaces[1]
            } else{
                king = edgeFaces[0]
            }
        }
    } 
    return king
}

function isKing(center, king, map){
    for (let i = 0; i < map.length; i++) {
        if (map[i][4] === center){
            return king === i;
        }   
    }
}

export async function kingAlgorithm(map, history, panel=null, animationDuration=0, changeBg=false){    
    for (let _ = 0; _ < 4; _++) {
        const neighbors = [0, 1, 4];
        const foreigns = [2, 3, 5];
        const frontCenter = map[0][4];
        const upperCenter = map[1][4];
        const backCenter  = map[4][4];
        const downCenter = map[5][4];
        const frontFace = getFacesByCube(frontCenter.cube)[0];
        const upperFace = getFacesByCube(upperCenter.cube)[0];
        const backFace  = getFacesByCube(backCenter.cube)[0];
        const downFace = map[5];

        if (
            downFace[1].colorId === downCenter.colorId
            && downFace[3].colorId === downCenter.colorId
            && downFace[5].colorId === downCenter.colorId
            && downFace[7].colorId === downCenter.colorId
        ){
            return;
        }

        let running = true;
        let edge;
        let edgeCube;
        let edgeFaces;
        let king;
        let move;
        let otherFace;
        let target;

        console.log("\n")
        while(running){
            edge = getPieceByFaceId("edge", [frontCenter.colorId, upperCenter.colorId], map)
            edgeCube = Number(Object.keys(edge)[0])
            edgeFaces = getFacesByCube(edgeCube)

            king = whoIsKing(map, edgeFaces, edgeCube, frontCenter)
            
            if (neighbors.includes(edgeFaces[0]) || neighbors.includes(edgeFaces[1])) {
                if (edgeFaces.includes(layerToFace.frontLayer)) {
                    console.log("~ The edge is on the front face:");
                    if (!edgeFaces.includes(layerToFace.upperLayer)){
                        console.log("# other face is foreign.");
                        console.log("> ROTATE the foreign face twice, then go to CASE 3.");

                        otherFace = edgeFaces[0] === 0 ? edgeFaces[1] : edgeFaces[0];
                        move = `${faceToLayer[otherFace][0].toUpperCase()}2`;
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);

                    } else if (!isKing(frontCenter, king, map)){
                        console.log("# the edge is between the front and upper face and front is not the KING.");
                        console.log("> edge is correctly placed.");
                        running = false;
                    }

                }
                if (edgeFaces.includes(layerToFace.upperLayer)) {
                    console.log("~ The edge is on the upper face.");
                    const isUpperKing = isKing(upperCenter, king, map)

                    if (isUpperKing){
                        console.log("# upper face is the KING");
                        console.log("> REPEAT U until the edge is located between the upper and front faces.");
                        target = 2;
                    }else{
                        console.log("# upper face is not the KING");
                        console.log("> REPEAT U until the edge is located between the upper and back faces, then go to CASE 3.");
                        target = 20;
                    }

                    move = getOptimalMove("upperLayer", "edge", edgeCube, target);
                    console.log("function getOptimalMove:", move);
                    if (move.length > 0){
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                    }

                    running = !isUpperKing;
                }
                if (edgeFaces.includes(layerToFace.backLayer)) {
                    console.log("~ The edge is on the back face.");
                    console.log("# back face is the KING");
                    console.log("> REPEAT B until the edge is located between the upper and back faces");
                    
                    move = getOptimalMove("backLayer", "edge", edgeCube, 20)
                    console.log("function getOptimalMove:", move);
                    if (move.length > 0){
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                    }

                    if (isKing(backCenter, king, map)){
                        console.log("> then execute: B L U' L'");

                        move = ["B", "L", "U'", "L'"]
                        await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
                        running = false;
                    }
                }
            } else {
                console.log("~ The edge is located between two foreign faces.");
                if (edgeFaces.includes(layerToFace.leftLayer)){
                    console.log("# the edge is between the left and down faces");
                    console.log("> Execute: D' B' D");
                    move = ["D'", "B'", "D"]
                }else{
                    console.log("# the edge is between the right and down faces");
                    console.log("> Execute: D B D'");
                    move = ["D", "B", "D'"]
                }
                await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
            }
        }
        console.log("~ edge is correctly placed")
        console.log("> Execute z'")

        move = "z'";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        console.log("\n\n\n")
    }

    await executeMove("x'", "solver", map, history, panel, animationDuration, changeBg);  
}