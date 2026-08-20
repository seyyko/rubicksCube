import { executeMove } from "./cubeRotation.js";
import { cubeMap, resetMap } from "./cubeMap.js";
import { resetHistory, deleteGroup, opposite } from "./history.js";
import { shuffleCube, wait } from "./shuffle.js";
import { updateColor, resetColor } from "./colors.js";
import { history, historyPanel, animationDuration } from "./main.js";
import { createPopup } from "./popup.js";
import { resetPosition } from "./pan.js";
import { algorithm } from "./algorithm.js";

// const & var

const movesButtons = document.querySelectorAll("#controls .moves button");

const resetCubeBtn = document.querySelector("#commands .reset");
const shuffleCubeBtn = document.querySelector("#commands .shuffle");
const resolveBtn = document.querySelector("#commands .resolve");

const toolsContainer = document.querySelector("#controls .tools");

const colorsContainer = document.querySelector(".paintCube");
const colorPreviews = colorsContainer.querySelectorAll("span");
const colorPickerInputs = colorsContainer.querySelectorAll("input");

const resetColorBtn = document.querySelector(".resetColor button");
const resetPosBtn = document.querySelector(".resetPos button");
const debugInput = document.querySelector(".debug input");
const mainCube = document.getElementById("mainCube");

const popup = document.getElementById("popup");

const solveBtn = document.querySelector(".solve button");
const previousBtn = document.querySelector(".previous");
const pauseBtn = document.querySelector(".pause");
const playBtn = document.querySelector(".play");
const stopBtn = document.querySelector(".stop");
const nextBtn = document.querySelector(".next");
const playbackControls = document.querySelector(".playbackControls");
const solvingDelayInput = document.querySelector(".solvingDelay input");

const solvingTimer = document.getElementById("timer");

let toolMode = false;

let selectedGroup = null;

let algoMoves = [];
let moveDone = [];
let isPlaying = false;
let isPaused = false;
let solvingDelay = solvingDelayInput.value * 100; // max 1s (0.2s anim + 0.8s delay)

let timerStart = 0;
let timerElapsed = 0;
let timerInterval = null;

export let selectedColor = "rgb(34, 34, 34)";

// functions

function disableBtns(list){
    list.forEach(element => {
        element.disabled = true;
    });
}

function enableBtns(list){
    list.forEach(element => {
        element.disabled = false;
    });
}

function resetAlgoMoves(){
    disableBtns(playbackControls.querySelectorAll("button"))
    algoMoves = [];
}

async function play(){
    if (isPlaying) return;

    isPlaying = true;
    isPaused = false;

    startTimer();
    while (algoMoves.length > 0 && !isPaused){
        await next()
        await wait(
            solvingDelay <= animationDuration ? 0 : solvingDelay - animationDuration
        ) // min 0 max .8s
    }

    isPlaying = false;

    if (algoMoves.length === 0) {
        finishTimer();
    }
}

function pause(){
    isPaused = true;
    stopTimer();
}

async function next(){
    if (algoMoves.length === 0) return;

    const move = algoMoves.shift();
    moveDone.push(move);
    await executeMove(move, "solver", cubeMap, history, historyPanel,
        solvingDelay < animationDuration ? solvingDelay : animationDuration,
        true); // min 0 max .2
}

async function previous(animDur=animationDuration){
    if (moveDone.length === 0) return;

    const move = moveDone.pop();
    algoMoves.unshift(move);
    await executeMove(opposite[move], "solver", cubeMap, history, historyPanel, animDur, true);
}

async function stop(){
    isPaused = true;
    resetTimer();

    while (moveDone.length > 0){
        await previous(0)
    }
}

function formatTimer(time){
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor(time / 1000) % 60;
    const centiseconds = Math.floor(time / 10) % 100;

    return `${String(minutes).padStart(2, "0")}:` +
           `${String(seconds).padStart(2, "0")}.` +
           `${String(centiseconds).padStart(2, "0")}`;
}

function updateTimer(){
    timerElapsed = Date.now() - timerStart;
    solvingTimer.textContent = formatTimer(timerElapsed);
}

function startTimer(){
    if (timerInterval) return;

    timerStart = Date.now() - timerElapsed;

    updateTimer();
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer(){
    stopTimer();

    timerElapsed = 0;
    solvingTimer.textContent = "00:00.00";
}

function finishTimer(){
    stopTimer();
    solvingTimer.textContent = formatTimer(timerElapsed);
    timerElapsed = 0;
}

// events

movesButtons.forEach(element => {
    element.addEventListener("click", async () => {
        const moveName = element.textContent;

        disableBtns(movesButtons)
        resetAlgoMoves();
        await executeMove(moveName, "user", cubeMap, history, historyPanel, animationDuration, true)
        enableBtns(movesButtons)
    });
});

resetCubeBtn.addEventListener("click", () => {
    resetTimer();
    resetMap();
    resetHistory(history, historyPanel);
    resetAlgoMoves();
});

shuffleCubeBtn.addEventListener("click", async () => {
    disableBtns(movesButtons)
    disableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
    resetAlgoMoves();
    await shuffleCube();
    enableBtns(movesButtons) 
    enableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
});

resolveBtn.addEventListener("click", () => {
    toolMode = !toolMode; // toggle on/off toolMode.

    document.querySelector("#controls .moves")
    .style.display = toolMode ? "none" : "grid";

    toolsContainer
    .style.display = toolMode ? "grid" : "none";

    resolveBtn.classList.toggle("active")
});

colorPreviews.forEach(preview => {
    const colorPickerInput = preview.querySelector("input");

    preview.addEventListener("click", () => {
        colorsContainer.style.backgroundColor = 
        colorPickerInput.value + "33";
        selectedColor = colorPickerInput.value;
        // opacity ~ 0.2 (33 for hex)
    });

    // right click
    preview.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        colorPickerInput.showPicker();
    });

    let timer;
    preview.addEventListener("pointerdown", () => {
        timer = setTimeout(() => {
            colorPickerInput.showPicker();
        }, 600); // long press for mobile user
    });

    preview.addEventListener("pointerup", () => {
        clearTimeout(timer);
    });
    preview.addEventListener("pointerleave", () => {
        clearTimeout(timer);
    });
});

colorPickerInputs.forEach(element => {
    element.addEventListener("change", () => {
        updateColor();
        colorsContainer.style.backgroundColor = 
        element.value + "33";
    });
});

resetColorBtn.addEventListener("click", () => {
    resetColor();
});

resetPosBtn.addEventListener("click", () => {
    resetPosition(animationDuration);
});

debugInput.addEventListener("click", () => {
    if (debugInput.checked) mainCube.classList.add("showCell");
    else mainCube.classList.remove("showCell");
})

historyPanel.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    selectedGroup = button;
    const groupId = parseInt(selectedGroup.id);
    const groupChildren = [...selectedGroup.children]
        .map(child => child.textContent)
        .join(", ");

    createPopup(
    "Are you sure you want to delete this following group ?",
    ["GROUP ID:", groupId],
    ["GROUP CHILDREN:", groupChildren])
    popup.style.display = "grid";
});

popup.addEventListener("click", async (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    if (button.textContent === "yes") {
        resetAlgoMoves()
        await deleteGroup(history, historyPanel, parseInt(selectedGroup.id));
    }

    popup.style.display = "none";
});

playbackControls.querySelectorAll("button").forEach(element => {
    element.addEventListener("click", async () => {
        const btnName = element.classList[0];
        element.disabled = true;
        disableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
        disableBtns(movesButtons);
        switch (btnName) {
            case "previous":
                await previous()
                break;
            case "pause":
                await pause()   
                break;
            case "play":
                await play()
                break;
            case "stop":
                await stop() 
                break;
            case "next":
                await next()
                break;
        }
        element.disabled = false;
        enableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
        enableBtns(movesButtons);
    })
});

solveBtn.addEventListener("click", async () => {
    if (algoMoves.length > 0) return;

    disableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
    disableBtns(movesButtons);
    resetTimer()

    algoMoves = await algorithm(cubeMap);
    moveDone = [];

    enableBtns([solveBtn, resetCubeBtn, shuffleCubeBtn]);
    enableBtns(movesButtons);

    if (algoMoves.length > 0) {
        enableBtns(playbackControls.querySelectorAll("button"));
    }
});

solvingDelayInput.addEventListener("input", () => {
    solvingDelay = solvingDelayInput.value * 100;
    document.querySelector(".solvingDelay label:nth-of-type(2)").textContent = `${solvingDelay / 1000}sec`;
});

window.addEventListener("load", () => {
    resetAlgoMoves();
    document.querySelector(".solvingDelay label:nth-of-type(2)").textContent = `${solvingDelay / 1000}sec`;
});



