import { resetSelectedColor, selectedColor, selectedColorId, setSelectedColor } from "./eventHandler.js";
import { cubeToFaces, faceToLayer } from "./layerHandler.js";
import { scanBoxMap } from "./cubeMap.js";

const canvas = document.querySelector("#canvas");
const mainCube = document.querySelector("#mainCube");
const scanBoxCube = document.querySelector("#scanBox .cubeContainer");

let pointerDown = false;
let drag = false;

let x = 0;
let y = 0;

let clickedFace = null;

const posX = -30;
const posY = -45;

let rx = posX;
let ry = posY;

let tempSelectedColor;
let tempSelectedColorId;

document.querySelectorAll(".cube p").forEach(element => {
    element.style.transform = `rotateY(${-posY}deg) rotateX(${-posX}deg)`;
});

canvas.addEventListener("contextmenu", e => e.preventDefault());

canvas.addEventListener("pointerdown", e => {
    if (e.target.closest("#camera, #crop")) return;

    pointerDown = true;
    drag = false;

    x = e.clientX;
    y = e.clientY;

    clickedFace = e.target.closest("#scanBox .face");
    tempSelectedColor = selectedColor;
    tempSelectedColorId = selectedColorId;
    if (e.button == 2) {
        e.preventDefault()
        resetSelectedColor();
    }

    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", e => {
    if (!pointerDown) return;

    const dx = e.clientX - x;
    const dy = e.clientY - y;

    if (!drag && Math.hypot(dx, dy) > 3) {
        drag = true;
    }

    if (!drag) return;

    ry += dx * 0.4;
    rx -= dy * 0.4;

    x = e.clientX;
    y = e.clientY;

    document.body.style.cursor = "grab";

    [mainCube, scanBoxCube]
    .map(cube => cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`);

    if (mainCube.classList.contains("showCell")) {
        document.querySelectorAll(".cube p").forEach(element => {
            element.style.transform =
                `rotateY(${-ry}deg) rotateX(${-rx}deg)`;
        });
    }
});

canvas.addEventListener("pointerup", e => {
    if (!drag && clickedFace){
        clickedFace.style.backgroundColor = selectedColor;
        const position =
        Array.from(clickedFace.parentElement.children)
        .indexOf(clickedFace) + 1;
        
        const cube = parseInt(clickedFace.parentElement.id.slice(1));
        const layerData = cubeToFaces[cube][position];
        const face = layerData[0];
        const piece = layerData[1];

        scanBoxMap[face][piece].color = selectedColor;
        scanBoxMap[face][piece].colorId = selectedColorId;
    }

    pointerDown = false;
    drag = false;
    clickedFace = null;
    setSelectedColor(tempSelectedColor, tempSelectedColorId);
    document.body.style.cursor = "default";

    canvas.releasePointerCapture(e.pointerId);
});


canvas.addEventListener("pointercancel", e => {
    pointerDown = false;
    drag = false;
    clickedFace = null;

    if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
    }
});

export function resetPosition(ms){
    mainCube.style.transition = `transform ${ms / 1000}s ease`;
    mainCube.style.transform = `rotateX(${posX}deg) rotateY(${posY}deg)`;
    scanBoxCube.style.transition = `transform ${ms / 1000}s ease`;
    scanBoxCube.style.transform = `rotateX(${posX}deg) rotateY(${posY}deg)`;

    setTimeout(() => {
        mainCube.style.transition = `none`;
        scanBoxCube.style.transition = `none`;
        document.querySelectorAll(".cube p").forEach(element => {
            element.style.transform = `rotateY(${-posY}deg) rotateX(${-posX}deg)`;
        });
        rx = posX;
        ry = posY;
    }, ms);
}