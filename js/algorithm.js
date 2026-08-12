import { cubeMap } from "./cubeMap.js"
import { executeMoves } from "./cubeRotation.js";
import { edgeParking, invertedTCase } from "./edgeParking.js";
import { kingAlgorithm } from "./king.js"

// resolution algorithm steps:
// 1. white cross
// 2. LBL
// 3. yellow cross
// 4. matching yellow cross sides
// 5. matching yellow corner
// 6. final moveset

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

    // cross
    await kingAlgorithm(clonedMap, moves);

    // LBL
    await invertedTCase(clonedMap, moves);

    // edgeparking
    await edgeParking(clonedMap, moves);

    console.log("length of algo moves:", moves.length)

    // await executeMoves(moves, "solver", map, history, panel, animationDuration, changeBg)
    return moves;
}