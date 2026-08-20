import { selectedColor } from "./eventHandler.js";

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

document.querySelectorAll(".cube p").forEach(element => {
    element.style.transform = `rotateY(${-posY}deg) rotateX(${-posX}deg)`;
});

canvas.addEventListener("pointerdown", e => {
    pointerDown = true;
    drag = false;

    x = e.clientX;
    y = e.clientY;

    clickedFace = e.target.closest("#scanBox .face");

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

    mainCube.style.transform =
        `rotateX(${rx}deg) rotateY(${ry}deg)`;

    scanBoxCube.style.transform =
        `rotateX(${rx}deg) rotateY(${ry}deg)`;

    if (mainCube.classList.contains("showCell")) {
        document.querySelectorAll(".cube p").forEach(element => {
            element.style.transform =
                `rotateY(${-ry}deg) rotateX(${-rx}deg)`;
        });
    }
});


canvas.addEventListener("pointerup", e => {
    if (!drag && clickedFace) {
        clickedFace.style.backgroundColor = selectedColor;
    }

    pointerDown = false;
    drag = false;
    clickedFace = null;

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