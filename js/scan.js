import { selectedColor } from "./eventHandler.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button");
const scanBoxCube = scanBox.querySelector(".cubeContainer");

const mainCanvas = [
    document.querySelector("#canvas #mainCube"),
    document.querySelector("#canvas #timer")
]

export let isScanBoxShowed = false;

function showScanDiv(){
    scanBox.style.display = "grid";
    mainCanvas.forEach(element => {
        element.style.display = "none";
    });
}
function hideScanDiv(){
    mainCanvas.forEach(element => {
        element.style.display = "grid";
    });
    scanBox.style.display = "none";
}

scanBoxBtn.addEventListener("click", () => {
    mainCanvas.forEach(element => {
        element.style.display = 
            isScanBoxShowed ?
            "grid":
            "none";
    });
    scanBox.style.display = 
        isScanBoxShowed ?
        "none":
        "grid";

    isScanBoxShowed = !isScanBoxShowed
});