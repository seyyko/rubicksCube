import { getFacesColors } from "./algoMatchingUpperPieces.js";
import { getPieceByFaceId, getFacesByCube } from "./cubeMap.js";
import { getOptimalMove, executeMoves, executeMove } from "./cubeRotation.js";
import { faceToLayer, layerToFace } from "./layerHandler.js";

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

function whoIsKing(map, edgeFaces, edgeCube, frontCenterColor){
    let king;
    for (let i = 0; i < map[edgeFaces[0]].length; i++) {
        if (map[edgeFaces[0]][i].cube === edgeCube){
            if (map[edgeFaces[0]][i].colorId === frontCenterColor){
                king = edgeFaces[1]
            } else{
                king = edgeFaces[0]
            }
        }
    } 
    return king
}

function isKing(centerColor, king, map){
    for (let i = 0; i < map.length; i++) {
        if (map[i][4].colorId === centerColor){
            return king === i;
        }   
    }
}

export async function kingAlgorithm(map, history, panel=null, animationDuration=0, changeBg=false){    
    for (let i = 0; i < 4; i++) {
        const neighbors = [0, 1, 4];
        const edgesCube = [1, 3, 5, 7]
        const faces = ["front", "back", "left", "right", "upper", "down"]
        const faceEdgePairs = {
            "front": ["upperEdgeDown", "rightEdgeLeft", "downEdgeUpper", "leftEdgeRight", "x'"],
            "upper": ["backEdgeDown", "rightEdgeUpper", "frontEdgeUpper", "leftEdgeUpper", "x2"],
            "right": ["upperEdgeRight", "backEdgeRight", "downEdgeRight", "frontEdgeRight", "z"],
            "left": ["upperEdgeLeft", "backEdgeLeft", "downEdgeLeft", "frontEdgeLeft", "z'"],
            "back": ["downEdgeDown", "rightEdgeRight", "upperEdgeUpper", "leftEdgeLeft", "x"],
            "down": ["frontEdgeDown", "rightEdgeDown", "downEdgeUpper", "leftEdgeDown"],
        }

        let facesColors = getFacesColors(map);
        let running = true;
        let edge;
        let edgeCube;
        let edgeFaces;
        let king;
        let move;
        let otherFace;
        let target;

        if (
            facesColors.downEdgeUpper === facesColors.downCenter
            && facesColors.downEdgeRight === facesColors.downCenter
            && facesColors.downEdgeDown === facesColors.downCenter
            && facesColors.downEdgeLeft === facesColors.downCenter

            && facesColors.frontEdgeDown === facesColors.frontEdgeDown
            && facesColors.rightEdgeDown === facesColors.rightCenter
            && facesColors.leftEdgeDown === facesColors.leftCenter
            && facesColors.backEdgeTop === facesColors.backCenter
        ){
            return;
        }

        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];

            if (
                facesColors[`${face}EdgeUpper`] === facesColors[`${face}Center`] &&
                facesColors[`${face}EdgeRight`] === facesColors[`${face}Center`] &&
                facesColors[`${face}EdgeDown`] === facesColors[`${face}Center`] &&
                facesColors[`${face}EdgeLeft`] === facesColors[`${face}Center`] &&
                !(
                    facesColors[faceEdgePairs[face][0]] ===
                    facesColors[faceEdgePairs[face][0].split(/(?=[A-Z])/)[0] + "Center"] &&

                    facesColors[faceEdgePairs[face][1]] ===
                    facesColors[faceEdgePairs[face][1].split(/(?=[A-Z])/)[0] + "Center"] &&

                    facesColors[faceEdgePairs[face][2]] ===
                    facesColors[faceEdgePairs[face][2].split(/(?=[A-Z])/)[0] + "Center"] &&

                    facesColors[faceEdgePairs[face][3]] ===
                    facesColors[faceEdgePairs[face][3].split(/(?=[A-Z])/)[0] + "Center"]
                )
            ){
                while(
                    facesColors[faceEdgePairs[face][0]] !==
                    facesColors[faceEdgePairs[face][0].split(/(?=[A-Z])/)[0] + "Center"]
                ){
                    move = faces[i][0].toUpperCase();
                    await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                    facesColors = getFacesColors(map);
                }
                if (faceEdgePairs[face][4]){
                    await executeMove(faceEdgePairs[face][4], "solver", map, history, panel, animationDuration, changeBg);  
                }
                return;
            }
        }

        console.log("\n")
        while(running){
            edge = getPieceByFaceId("edge", [facesColors.frontCenter, facesColors.upperCenter], map)
            edgeCube = Number(Object.keys(edge)[0])
            edgeFaces = getFacesByCube(edgeCube)

            king = whoIsKing(map, edgeFaces, edgeCube, facesColors.frontCenter)
            
            if (neighbors.includes(edgeFaces[0]) || neighbors.includes(edgeFaces[1])) {
                if (edgeFaces.includes(layerToFace.frontLayer)) {
                    console.log("#kingAlgorithm# the edge is on the front face:");
                    if (!edgeFaces.includes(layerToFace.upperLayer)){
                        console.log("#kingAlgorithm# other face is foreign.");
                        console.log("#kingAlgorithm# rotate the foreign face twice, then go to case 3.");

                        otherFace = edgeFaces[0] === 0 ? edgeFaces[1] : edgeFaces[0];
                        move = `${faceToLayer[otherFace][0].toUpperCase()}2`;
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                        facesColors = getFacesColors(map);
                    } else if (!isKing(facesColors.frontCenter, king, map)){
                        console.log("#kingAlgorithm# the edge is between the front and upper face and front is not the king.");
                        console.log("#kingAlgorithm# edge is correctly placed.");
                        running = false;
                    }
                }
                if (edgeFaces.includes(layerToFace.upperLayer)) {
                    console.log("#kingAlgorithm# the edge is on the upper face.");
                    const isUpperKing = isKing(facesColors.upperCenter, king, map)

                    if (isUpperKing){
                        console.log("#kingAlgorithm# upper face is the king");
                        console.log("#kingAlgorithm# repeat U until the edge is located between the upper and front faces.");
                        target = 2;
                    }else{
                        console.log("#kingAlgorithm# upper face is not the king");
                        console.log("#kingAlgorithm# repeat U until the edge is located between the upper and back faces, then go to case 3.");
                        target = 20;
                    }

                    move = getOptimalMove("upperLayer", "edge", edgeCube, target);
                    console.log("function getOptimalMove:", move);
                    if (move.length > 0){
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                        facesColors = getFacesColors(map);
                    }

                    running = !isUpperKing;
                }
                if (edgeFaces.includes(layerToFace.backLayer)) {
                    console.log("#kingAlgorithm# the edge is on the back face.");
                    console.log("#kingAlgorithm# back face is the king");
                    console.log("#kingAlgorithm# repeat 'B' until the edge is located between the upper and back faces");
                    
                    move = getOptimalMove("backLayer", "edge", edgeCube, 20)
                    console.log("function getOptimalMove:", move);
                    if (move.length > 0){
                        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
                        facesColors = getFacesColors(map);
                    }

                    if (isKing(facesColors.backCenter, king, map)){
                        console.log("#kingAlgorithm# then execute: B L U' L'");

                        move = ["B", "L", "U'", "L'"]
                        await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
                        facesColors = getFacesColors(map);
                        running = false;
                    }
                }
            } else {
                console.log("#kingAlgorithm# the edge is located between two foreign faces.");
                if (edgeFaces.includes(layerToFace.leftLayer)){
                    console.log("#kingAlgorithm# the edge is between the left and down faces");
                    console.log("#kingAlgorithm# execute: D' B' D");
                    move = ["D'", "B'", "D"]
                }else{
                    console.log("#kingAlgorithm# the edge is between the right and down faces");
                    console.log("#kingAlgorithm# execute: D B D'");
                    move = ["D", "B", "D'"]
                }
                await executeMoves(move, "solver", map, history, panel, animationDuration, changeBg);
                facesColors = getFacesColors(map);
            }
        }
        console.log("#kingAlgorithm# edge is correctly placed, execute z'")

        move = "z'";
        await executeMove(move, "solver", map, history, panel, animationDuration, changeBg);
        facesColors = getFacesColors(map);
        console.log("\n\n\n")
    }

    console.log("#kingAlgorithm# cross is done execute x' to put the cross down.")
    await executeMove("x'", "solver", map, history, panel, animationDuration, changeBg);  
}