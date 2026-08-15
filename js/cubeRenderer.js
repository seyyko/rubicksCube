import { colors } from "./colors.js";

// Returns one row of a face as a string.
// If no face is provided, returns a blank spacer
// used to align the unfolded cube representation.
function getLineColor(list=null, y=0){
    let m = "";
    for (let i = 0; i < 3; i++) {
        // Convert the face ID into its color abbreviation
        // (W, O, B, G, Y, R).
        // When no face is provided, use "|" as padding.
        let abbreviatedColor = list ? colors[list[i+(3 * y)].colorId].abbreviatedColor : "|";
        m += `${abbreviatedColor} `;
    } return m
}

export function renderMap(list) {
    // Render the cube as a 2D net in the console.
    // Layout:
    //
    //     [4]
    //     [1]
    // [3] [0] [2]
    //     [5]
    //
    // Each face is displayed as a 3x3 grid using
    // color abbreviations instead of full color names.
    console.log(
        `${getLineColor()}${getLineColor(list[4], 0)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[4], 1)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[4], 2)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[1], 0)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[1], 1)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[1], 2)}${getLineColor()}`,
        `\n${getLineColor(list[3], 0)}${getLineColor(list[0], 0)}${getLineColor(list[2], 0)}`,
        `\n${getLineColor(list[3], 1)}${getLineColor(list[0], 1)}${getLineColor(list[2], 1)}`,
        `\n${getLineColor(list[3], 2)}${getLineColor(list[0], 2)}${getLineColor(list[2], 2)}`,
        `\n${getLineColor()}${getLineColor(list[5], 0)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[5], 1)}${getLineColor()}`,
        `\n${getLineColor()}${getLineColor(list[5], 2)}${getLineColor()}`
    )
}