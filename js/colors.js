import { updateBackground, cubeMap } from "./cubeMap.js";

// Default cube colors.
// Each color is associated with a one-letter abbreviation
// used throughout the rendering of the cube map.
const baseColors = [
    {
        "color": "#ffffff",
        "abbreviatedColor": "W"
    },
    {
        "color": "#ffa500",
        "abbreviatedColor": "O"
    },
    {
        "color": "#0000ff",
        "abbreviatedColor": "B"
    },
    {
        "color": "#008000",
        "abbreviatedColor": "G"
    },
    {
        "color": "#ffff00",
        "abbreviatedColor": "Y"
    },
    {
        "color": "#ff0000",
        "abbreviatedColor": "R"
    }
]
const colorsEl = document.querySelector(".paintCube");

// Initializes the color configuration.
// - Resets all color inputs to their default values.
// - Creates and returns a copy of the default color list.
function initColor(){
    let temp = Array();
    for (let i = 0; i < baseColors.length; i++) {
        // Synchronize the color picker with the default value.
        const spanEl = colorsEl.querySelector(`span:nth-of-type(${i+1})`)
        const inputEl = colorsEl.querySelector(`span:nth-of-type(${i+1}) input`)
        inputEl.value = baseColors[i].color;
        spanEl.style.backgroundColor = baseColors[i].color;
        colorsEl.style.backgroundColor = "rgba(34, 34, 34, 0.2)";
        
        // Create a fresh object to avoid modifying baseColors directly.
        temp.push({
            "color": baseColors[i].color,
            "abbreviatedColor": baseColors[i].abbreviatedColor
        });
    }
    return temp
}

export let colors = initColor();

export function updateColor(){
    for (let i = 0; i < colors.length; i++) {
        // Read the current value from the corresponding color picker
        // and update the application's color configuration.
        let tempColor = colors[i].color;
        colors[i].color = colorsEl.querySelector(`span:nth-of-type(${i+1}) input`).value;
        colorsEl.querySelector(`span:nth-of-type(${i + 1})`).style.backgroundColor = colors[i].color;
    }
    updateBackground(cubeMap, true);
}

export function resetColor(){
    colors = initColor();
    updateBackground(cubeMap, true);
}

export function getFacesColors(map) {
    const facesName = ["front", "upper", "right", "left", "back", "down"];

    const positions = {
        CornerUpperLeft: 0,
        EdgeUpper: 1,
        CornerUpperRight: 2,
        EdgeLeft: 3,
        Center: 4,
        EdgeRight: 5,
        CornerDownLeft: 6,
        EdgeDown: 7,
        CornerDownRight: 8
    };

    const temp = {};

    for (let i = 0; i < facesName.length; i++) {
        const faceName = facesName[i];

        for (const [positionName, positionId] of Object.entries(positions)) {
            temp[`${faceName}${positionName}`] = map[i][positionId].colorId;
        }
    }

    return temp;
}