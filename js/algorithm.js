import { cubeMap } from "./cubeMap.js"
import { kingAlgorithm } from "./king.js"

// resolution algorithm steps:
// 1. white cross
// 2. F2L
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

export function setCross(){
    let map = cloneMap(cubeMap);
    const crossMoves = Array();
    kingAlgorithm(map, crossMoves);
    return crossMoves;
}