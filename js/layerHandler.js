const mainCube = document.getElementById("mainCube");
const tempLayer = document.createElement("div");
tempLayer.className = "layer";

export const layer = tempLayer;

// Concept:
// Instead of thinking about the cube in 3D,
// each movable layer is represented as a 3×3 grid:
//
// [] [] []
// [] [] []
// [] [] []
//
// When a move is performed, the corresponding
// 9 cube are moved into the temporary "layer"
// element and rotated together.

// To better understand these grids,
// enable the "showCell" class on #mainCube
// or activate debug mode in the interface.
// Each cube displays its ID, making it easier
// to visualize how the layers are built.
export const layers = [
    // Front face (F)
    {
        "name": "frontLayer",
        "grid": [
                "c1","c2","c3",
                "c4","c5","c6",
                "c7","c8","c9",
                ],
        "rotateAxis": "z"
    },
    // Back face (B)
    {
        "name": "backLayer",
        "grid": [
                "c25","c26","c27",
                "c22","c23","c24",
                "c19","c20","c21",
                ],
        "rotateAxis": "z"
    },
    // Left face (L)
    {
        "name": "leftLayer",
        "grid": [
                "c19","c10","c1",
                "c22","c13","c4",
                "c25","c16","c7",
                ],
        "rotateAxis": "x"
    },
    // Right face (R)
    {
        "name": "rightLayer",
        "grid": [
                "c3","c12","c21",
                "c6","c15","c24",
                "c9","c18","c27",
                ],
        "rotateAxis": "x"
    },
    // Upper face (U)
    {
        "name": "upperLayer",
        "grid": [
                "c19","c20","c21",
                "c10","c11","c12",
                "c1","c2","c3",
                ],
        "rotateAxis": "y"
    },
    // Down face (D)
    {
        "name": "downLayer",
        "grid": [
                "c7","c8","c9",
                "c16","c17","c18",
                "c25","c26","c27"
                ],
        "rotateAxis": "y"
    },
    // Middle slice parallel to L/R faces (M)
    {
        "name": "middleLayer",
        "grid": [
                "c2","c5","c8",
                "c11","c14","c17",
                "c20","c23","c26"
                ],
        "rotateAxis": "x"
    },
    // Middle slice parallel to U/D faces (E)
    {
        "name": "equatorLayer",
        "grid": [
                "c4","c5","c6",
                "c13","c14","c15",
                "c22","c23","c24"
                ],
        "rotateAxis": "y"
    },
    // Middle slice parallel to F/B faces (S)
    {
        "name": "standingLayer",
        "grid": [
                "c10","c11","c12",
                "c13","c14","c15",
                "c16","c17","c18"
                ],
        "rotateAxis": "z"
    }
]

export const layerToFace = {
    "frontLayer": 0,
    "backLayer":  4,
    "leftLayer":  3,
    "rightLayer": 2,
    "upperLayer": 1,
    "downLayer":  5,
}
export const faceToLayer = {
    0: "frontLayer",
    4: "backLayer",
    3: "leftLayer",
    2: "rightLayer",
    1: "upperLayer",
    5: "downLayer",
}

export const cubeToFaces = {
    1: {
        2: [0, 0], 
        3: [1, 6], 
        5: [3, 2]
    },
    2: {
        2: [0, 1], 
        3: [1, 7]
    },
    3: {
        2: [0, 2], 
        3: [1, 8], 
        6: [2, 0]
    },
    4: {
        2: [0, 3], 
        5: [3, 5]
    },
    5: {
        2: [0, 4]
    },
    6: {
        2: [0, 5], 
        6: [2, 3]
    },
    7: {
        2: [0, 6], 
        4: [5, 0],
        5: [3, 8]
    },
    8: {
        2: [0, 7],
        4: [5, 1]
    },
    9: {
        2: [0, 8],
        4: [5, 2],
        6: [2, 6]
    },

    10: {
        3: [1, 3],
        5: [3, 1]
    },
    11: {
        3: [1, 4]
    },
    12: {
        3: [1, 5], 
        6: [2, 1]
    },
    13: {
        5: [3, 4]
    },
    14: {},
    15: {
        6: [2, 4]
    },
    16: {
        4: [5, 3], 
        5: [3, 7]
    },
    17: {
        4: [5, 4]
    },
    18: {
        4: [5, 5],
        6: [2, 7]
    },

    19: {
        1: [4, 6],
        3: [1, 0],
        5: [3, 0]
    },
    20: {
        1: [4, 7],
        3: [1, 1]
    },
    21: {
        1: [4, 8],
        3: [1, 2],
        6: [2, 2]
    },
    22: {
        1: [4, 3],
        5: [3, 3]
    },
    23: {
        1: [4, 4]
    },
    24: {
        1: [4, 5],
        6: [2, 5]
    },
    25: {
        1: [4, 0],
        4: [5, 6],
        5: [3, 6]
    },
    26: {
        1: [4, 1],
        4: [5, 7]
    },
    27: {
        1: [4, 2],
        4: [5, 8],
        6: [2, 8]
    }
}

export function resetLayer(){
    // Restore every cube currently inside the
    // temporary layer back to the main cube.
    let temp = layer.firstChild;
    
    while(layer.firstChild){
        mainCube.appendChild(temp);
        temp = layer.firstChild;
    }
}

