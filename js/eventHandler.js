import { executeMove } from "./cubeRotation.js";
import { cubeMap, resetMap } from "./cubeMap.js";
import { resetHistory, deleteGroup } from "./history.js";
import { shuffleCube } from "./shuffle.js";
import { updateColor, resetColor } from "./colors.js";
import { history, historyPanel, animationDuration } from "./main.js";
import { createPopup } from "./popup.js";
import { resetPosition } from "./pan.js";

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

const movesButtons = document.querySelectorAll("#controls .moves button");
movesButtons.forEach(element => {
    element.addEventListener("click", async () => {
        const moveName = element.textContent;

        disableBtns(movesButtons)
        await executeMove(moveName, "user", cubeMap, history, historyPanel, animationDuration, true)
        enableBtns(movesButtons) 
    });
});

const resetEL = document.querySelector("#commands .reset")
resetEL.addEventListener("click", () => {
    resetMap();
    resetHistory(history, historyPanel);
});

const shuffleEl = document.querySelector("#commands .shuffle")
shuffleEl.addEventListener("click", async () => {
    disableBtns(movesButtons)
    await shuffleCube();
    enableBtns(movesButtons) 
});

const resolveBtn = document.querySelector("#commands .resolve")
const toolsContainer = document.querySelector("#controls .tools")
let toolMode = false;
resolveBtn.addEventListener("click", () => {
    toolMode = !toolMode; // toggle on/off toolMode.

    document.querySelector("#controls .moves")
    .style.display = toolMode ? "none" : "flex";

    toolsContainer
    .style.display = toolMode ? "flex" : "none";

    resolveBtn.classList.toggle("active")
});

// colorPicker

const colorsContainer = document.querySelector(".paintCube");
const colorPreviews = colorsContainer.querySelectorAll("span");

colorPreviews.forEach(preview => {
    const colorPickerInput = preview.querySelector("input");

    preview.addEventListener("click", () => {
        colorsContainer.style.backgroundColor = 
        colorPickerInput.value + "33";
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

const colorPickerInputs = colorsContainer.querySelectorAll("input");
colorPickerInputs.forEach(element => {
    element.addEventListener("change", () => {
        updateColor();
        colorsContainer.style.backgroundColor = 
        element.value + "33";
    });
});

const resetColorEl = document.querySelector(".resetColor button")
resetColorEl.addEventListener("click", () => {
    resetColor();
});

const resetPosEl = document.querySelector(".resetPos button")
resetPosEl.addEventListener("click", () => {
    resetPosition(animationDuration);
});

const debugInput = document.querySelector(".debug input");
const mainCube = document.getElementById("mainCube");
debugInput.addEventListener("click", () => {
    if (debugInput.checked) mainCube.classList.add("showCell");
    else mainCube.classList.remove("showCell");
})

// popup

const popup = document.getElementById("popup");
let selectedGroup = null;

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
        await deleteGroup(history, historyPanel, parseInt(selectedGroup.id));
    }

    popup.style.display = "none";
});

// playbackControls

const previousBtn = document.querySelector(".previous");
const pauseBtn = document.querySelector(".pause");
const playBtn = document.querySelector(".play");
const stopBtn = document.querySelector(".stop");
const nextBtn = document.querySelector(".next");

const playbackControls = document.querySelector(".playbackControls")
playbackControls.querySelectorAll("button").forEach(element => {
    element.addEventListener("click", async () => {
        const btnName = element.classList[0];
        switch (btnName) {
            case "previous":
                
                break;
            case "pause":
                
                break;
            case "play":
                
                break;
            case "stop":
                
                break;
            case "next":
                
                break;
        }
    })
});

