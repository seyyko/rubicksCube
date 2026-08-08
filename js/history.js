// Maps every move to its inverse.
// Used to simplify move history by detecting
// cancellations and equivalent move sequences.
//
// Examples:
// F  <-> F'
// F2 <-> F'2

import { cubeMap } from "./cubeMap.js";
import { executeMove } from "./cubeRotation.js";

// x  <-> x'
const opposite = {
    "F": "F'",
    "F'": "F",
    "F2": "F'2",
    "F'2": "F2",

    "B": "B'",
    "B'": "B",
    "B2": "B'2",
    "B'2": "B2",

    "L": "L'",
    "L'": "L",
    "L2": "L'2",
    "L'2": "L2",

    "R": "R'",
    "R'": "R",
    "R2": "R'2",
    "R'2": "R2",

    "U": "U'",
    "U'": "U",
    "U2": "U'2",
    "U'2": "U2",

    "D": "D'",
    "D'": "D",
    "D2": "D'2",
    "D'2": "D2",

    "M": "M'",
    "M'": "M",
    "M2": "M'2",
    "M'2": "M2",

    "E": "E'",
    "E'": "E",
    "E2": "E'2",
    "E'2": "E2",

    "S": "S'",
    "S'": "S",
    "S2": "S'2",
    "S'2": "S2",

    "u": "u'",
    "u'": "u",
    "u2": "u'2",
    "u'2": "u2",
    
    "d": "d'",
    "d'": "d",
    "d2": "d'2",
    "d'2": "d2",
    
    "r": "r'",
    "r'": "r",
    "r2": "r'2",
    "r'2": "r2",
    
    "l": "l'",
    "l'": "l",
    "l2": "l'2",
    "l'2": "l2",
    
    "f": "f'",
    "f'": "f",
    "f2": "f'2",
    "f'2": "f2",
    
    "b": "b'",
    "b'": "b",
    "b2": "b'2",
    "b'2": "b2",

    "x": "x'",
    "x'": "x",
    "x2": "x'2",
    "x'2": "x2",
    
    "y": "y'",
    "y'": "y",
    "y2": "y'2",
    "y'2": "y2",
    
    "z": "z'",
    "z'": "z",
    "z2": "z'2",
    "z'2": "z2",
};

const sections = {
    "clockwise moves": ["F", "B", "L", "R", "U", "D", "M", "E", "S"],
    "counter-clockwise moves": ["F'", "B'", "L'", "R'", "U'", "D'", "M'", "E'", "S'"],
    "cube rotations": ["x", "y", "z", "x'", "y'", "z'"],
    "wide moves": ["u", "d", "r", "l", "f", "b"],
    "wide counter-clockwise moves": ["u'", "d'", "r'", "l'", "f'", "b'"],
    "double moves": ["F2", "B2", "L2", "R2", "U2", "D2", "M2", "E2", "S2"]
};

export const moves = {
    "F": "frontLayer 1 1",
    "B": "backLayer -1 1",
    "L": "leftLayer -1 1",
    "R": "rightLayer 1 1",
    "U": "upperLayer -1 1",
    "D": "downLayer 1 1",
    "M": "middleLayer -1 1",
    "E": "equatorLayer 1 1",
    "S": "standingLayer 1 1",

    "F'": "frontLayer -1 1",
    "B'": "backLayer 1 1",
    "L'": "leftLayer 1 1",
    "R'": "rightLayer -1 1",
    "U'": "upperLayer 1 1",
    "D'": "downLayer -1 1",
    "M'": "middleLayer 1 1",
    "E'": "equatorLayer -1 1",
    "S'": "standingLayer -1 1",

    "x": "rightLayer middleLayer leftLayer 1 1 1 1 1 1",
    "y": "upperLayer equatorLayer downLayer -1 -1 -1 1 1 1",
    "z": "frontLayer standingLayer backLayer 1 1 1 1 1 1",

    "x'": "rightLayer middleLayer leftLayer -1 -1 -1 1 1 1",
    "y'": "upperLayer equatorLayer downLayer 1 1 1 1 1 1",
    "z'": "frontLayer standingLayer backLayer -1 -1 -1 1 1 1",

    "x2": "rightLayer middleLayer leftLayer 1 1 1 2 2 2",
    "y2": "upperLayer equatorLayer downLayer -1 -1 -1 2 2 2",
    "z2": "frontLayer standingLayer backLayer 1 1 1 2 2 2",

    "x'2": "rightLayer middleLayer leftLayer -1 -1 -1 2 2 2",
    "y'2": "upperLayer equatorLayer downLayer 1 1 1 2 2 2",
    "z'2": "frontLayer standingLayer backLayer -1 -1 -1 2 2 2",

    "u": "upperLayer equatorLayer -1 -1 1 1",
    "d": "downLayer equatorLayer 1 1 1 1",
    "r": "rightLayer middleLayer 1 1 1 1",
    "l": "leftLayer middleLayer -1 -1 1 1",
    "f": "frontLayer standingLayer 1 1 1 1",
    "b": "backLayer standingLayer -1 -1 1 1",
    
    "u'": "upperLayer equatorLayer 1 1 1 1",
    "d'": "downLayer equatorLayer -1 -1 1 1",
    "r'": "rightLayer middleLayer -1 -1 1 1",
    "l'": "leftLayer middleLayer 1 1 1 1",
    "f'": "frontLayer standingLayer -1 -1 1 1",
    "b'": "backLayer standingLayer 1 1 1 1",

    "u2": "upperLayer equatorLayer -1 -1 2 2",
    "d2": "downLayer equatorLayer 1 1 2 2",
    "r2": "rightLayer middleLayer 1 1 2 2",
    "l2": "leftLayer middleLayer -1 -1 2 2",
    "f2": "frontLayer standingLayer 1 1 2 2",
    "b2": "backLayer standingLayer -1 -1 2 2",
    
    "u'2": "upperLayer equatorLayer 1 1 2 2",
    "d'2": "downLayer equatorLayer -1 -1 2 2",
    "r'2": "rightLayer middleLayer -1 -1 2 2",
    "l'2": "leftLayer middleLayer 1 1 2 2",
    "f'2": "frontLayer standingLayer -1 -1 2 2",
    "b'2": "backLayer standingLayer 1 1 2 2",

    "F2": "frontLayer 1 2",
    "B2": "backLayer -1 2",
    "L2": "leftLayer -1 2",
    "R2": "rightLayer 1 2",
    "U2": "upperLayer -1 2",
    "D2": "downLayer 1 2",
    "M2": "middleLayer -1 2",
    "E2": "equatorLayer 1 2",
    "S2": "standingLayer 1 2",

    "F'2": "frontLayer -1 2",
    "B'2": "backLayer 1 2",
    "L'2": "leftLayer 1 2",
    "R'2": "rightLayer -1 2",
    "U'2": "upperLayer 1 2",
    "D'2": "downLayer -1 2",
    "M'2": "middleLayer 1 2",
    "E'2": "equatorLayer -1 2",
    "S'2": "standingLayer -1 2",
}

export function resetHistory(history, panel){
    // Remove every move from both the UI
    // and the internal history array.
    removeMove(history, history.length, panel);
}

export function addMove(move, moveSource, history, panel){
    history.push(move);

    if (panel) {
        const moveElement = document.createElement("p");
        moveElement.innerText = move;

        const lastGroup = panel.lastElementChild;

        if (
            lastGroup &&
            lastGroup.classList.contains("group") &&
            lastGroup.classList.contains(moveSource)
        ) {
            lastGroup.appendChild(moveElement);
        } else {
            const group = document.createElement("button");
            group.classList.add("group", moveSource);

            group.appendChild(moveElement);
            group.id = panel.children.length;
            panel.appendChild(group);
        }

        scrollHistory(panel)
    }

    checkForDouble(history, panel, moveSource);
    checkForTriple(history, panel, moveSource);
    checkForOpposite(history, panel, moveSource);
}

function removeMove(history, N, panel){
    for (let i = 0; i < N; i++) {
        history.pop();

        if (!panel) continue;

        const lastGroup = panel.lastElementChild;
        if (!lastGroup) continue;

        lastGroup.lastElementChild?.remove();

        if (lastGroup.children.length === 0) {
            lastGroup.remove();
        }
    }
}

function checkForDouble(history, panel, moveSource){
    // Simplifies consecutive identical moves.
    //
    // Examples:
    // F F     -> F2
    // F2 F2   -> nothing
    // F'2 F   -> F'
    //
    // Called after adding a new move.
    if (history.length > 1){
        const move = history[history.length - 1];
        const lastMove = history[history.length - 2];
        let newMove;

        // F F -> F2    
        if (move === lastMove && move[move.length - 1] !== '2'){
            newMove = `${move}2`;
            removeMove(history, 2, panel);
            addMove(newMove, moveSource, history, panel);
        // F'2 F -> F'
        }else if (lastMove == `${opposite[move]}2`){
            removeMove(history, 2, panel);
            addMove(opposite[move], moveSource, history, panel)
        // F F2 -> F'
        }else if (move === `${lastMove}2`){
            removeMove(history, 2, panel);
            addMove(opposite[lastMove], moveSource, history, panel)
        // F2 F2 -> ∅
        }else if (move === lastMove && move[move.length - 1] === '2'){
            removeMove(history, 2, panel);
        }
    }
}

function checkForTriple(history, panel, moveSource){
    // Simplifies sequences of three identical turns.
    //
    // Example:
    // F2 F -> F'
    //
    // Equivalent to three quarter turns
    // in the same direction.
    if (history.length > 1){
        const move = history[history.length - 1];
        const lastMove = history[history.length - 2];
        const double = `${move}2`

        if (lastMove === double && opposite[move]){
            removeMove(history, 2, panel);
            addMove(opposite[move], moveSource, history, panel);
        }
    }
}

function checkForOpposite(history, panel, moveSource){
    // Cancels opposite consecutive moves.
    //
    // Examples:
    // F F' -> ∅
    // R' R -> ∅
    // x x' -> ∅
    if (history.length > 1){
        const move = history[history.length - 1];
        const lastMove = history[history.length - 2];
        if (lastMove === opposite[move]){
            removeMove(history, 2, panel, moveSource)
        }
    }
}

function scrollHistory(panel) {
    requestAnimationFrame(() => {
        if (panel.scrollWidth > panel.clientWidth) {
            panel.scrollTo({
                left: panel.scrollWidth,
                behavior: "smooth"
            });
        }
    });
}

export function getMoveParameters(move){
    const content = moves[move].split(" ")
    const separator = (content.length / 3);
    // Extract:
    // - layer names,
    // - directions,
    // - number of quarter turns.
    return [content.slice(0, separator), content.slice(separator, separator * 2), content.slice(separator * 2, content.length)]
}

export function createMoves(){
    const moveSlider = document.querySelector("#controls .moves");

    for (const [title, moveList] of Object.entries(sections)) {
        const section = document.createElement("section");

        const heading = document.createElement("p");
        heading.textContent = title;

        const buttonsContainer = document.createElement("div");

        for (const move of moveList) {
            const button = document.createElement("button");
            button.textContent = move;
            buttonsContainer.appendChild(button);
        }

        section.appendChild(heading);
        section.appendChild(buttonsContainer);
        moveSlider.appendChild(section);
    }
}

export async function deleteGroup(history, historyPanel, groupId){
    const backUp = Array();
    console.log(`history before change: ${history}`)
    for (let i = historyPanel.children.length - 1; i > -1; i--) {
        let lastGroup = historyPanel.lastElementChild;
        for (let j = lastGroup.children.length - 1; j > -1; j--) {
            let move = lastGroup.children[j].textContent
            let moveSource = lastGroup.classList[1];
            console.log("testouille:", move, moveSource)
            if (i !== groupId){
                backUp.push([move, moveSource])
            }
            await executeMove(opposite[move], moveSource, cubeMap, history, historyPanel, 0, true)
        }
        if (i === groupId){
            for (let j = backUp.length- 1; j > -1; j--) {
                await executeMove(backUp[j][0], backUp[j][1], cubeMap, history, historyPanel, 0, true)
            }
            console.log(`group${groupId} has been successfully deleted.`)
            console.log(`history after change: ${history}`)
            break;
        }
    }
}