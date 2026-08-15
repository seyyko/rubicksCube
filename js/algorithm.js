import { cubeMap } from "./cubeMap.js"
import { executeMoves } from "./cubeRotation.js";
import { edgeParking, invertedTCase } from "./algoEdgeParking.js";
import { kingAlgorithm } from "./algoKing.js"
import { upperCross } from "./algoUpperCross.js";
import { matchingUpperCorners, matchingUpperEdges } from "./algoMatchingUpperPieces.js";

// resolution algorithm steps:
// 1. down cross
// 2. first layer
// 3. second layer
// 4. upper cross
// 5. matching upper cross sides
// 6. matching upper corner
// 7. final moveset

function cloneMap(map){
    return map.map(face =>
        face.map(piece => {
            const {obj, ...rest} = piece;
            return rest;
        })
    );
}

export async function algorithm(map){
    let clonedMap = cloneMap(map);
    const moves = Array();

    // king
    await kingAlgorithm(clonedMap, moves);

    // first layer
    await invertedTCase(clonedMap, moves);

    // edgeParking
    await edgeParking(clonedMap, moves);

    // upper cross
    await upperCross(clonedMap, moves);

    // matching upper edges
    await matchingUpperEdges(clonedMap, moves);

    // matching upper corners
    await matchingUpperCorners(clonedMap, moves)

    // 
    console.log("length of algo moves:", moves.length)

    return moves;
}