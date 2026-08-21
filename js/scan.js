import { scanBoxMap } from "./cubeMap.js";

const scanBox = document.getElementById("scanBox");
const scanBoxBtn = document.querySelector(".tools .scan button:nth-of-type(1)");
const scanBoxCheckBtn = document.querySelector(".tools .scan button:nth-of-type(2)");
// const scanBoxCube = scanBox.querySelector(".cubeContainer");

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

scanBoxCheckBtn.addEventListener("click", () => {
    const originalColor = "rgb(34, 34, 34)";
    let sbMap = scanBoxMap;
    console.log(sbMap)
})