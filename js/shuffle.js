import { cubeMap } from "./cubeMap.js";
import { moves } from "./history.js";
import { executeMove } from "./cubeRotation.js";
import { history, historyPanel } from "./main.js";

export function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function shuffleCube(){
    // Generate a 20-move scramble.
    for (let i = 0; i < 20; i++) {
        // Select a random move from the available buttons.
        const randomNumber = Math.floor(Math.random() * moves.length);
        const move = Object.keys(moves)[
            Math.floor(Math.random() * Object.keys(moves).length)
        ];
        await executeMove(move, "shuffle", cubeMap, history, historyPanel, 0, true)
    }
    console.log("randomly mixed cubeMap:", cubeMap)
}