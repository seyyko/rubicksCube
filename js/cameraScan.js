import { colors } from "./colors.js";
import {
    scanBoxMap,
    updateBackground
} from "./cubeMap.js";
import { layerToFace } from "./layerHandler.js";
import {
    getAverageColor,
    getPastelColor
} from "./colorDetection.js";

export function initCameraScan() {
    const cameraInput = document.querySelector("#camera input");
    const cameraBtns = document.querySelectorAll("#camera button");
    const cropContainer = document.getElementById("crop");
    const cameraCropBox = document.querySelector("#crop > div");
    const image = cameraCropBox.querySelector("#crop img");
    const cropConfirm = document.querySelector("#crop button");
    const anchors = document.querySelectorAll("#crop > div > div");

    let faceScanned = null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    let isDragging = false;
    let x = 0;
    let y = 0;
    let scale = 1;
    let lastX = 0;
    let lastY = 0;

    const pointers = new Map();
    let lastDistance = null;

    cameraBtns.forEach(button => {

        let timer = null;
        let longPress = false;

        const resetFace = () => {

            button.classList.remove("active");

            const face =
                scanBoxMap[
                    layerToFace[`${button.classList[0]}Layer`]
                ];

            for (let i = 0; i < face.length; i++) {
                face[i].color = "rgb(0, 0, 0)";
                face[i].colorId = null;
            }

            updateBackground(
                scanBoxMap,
                true,
                [0, 1, 2, 3, 4, 5, 6, 7, 8]
            );
        };

        button.addEventListener("click", event => {

            if (longPress) {
                event.preventDefault();
                event.stopPropagation();

                longPress = false;
                return;
            }

            cameraInput.click();
        });

        button.addEventListener("contextmenu", event => {

            event.preventDefault();

            faceScanned = button.classList[0];

            resetFace();
        });

        button.addEventListener("pointerdown", event => {

            if (event.button !== 0) {
                return;
            }

            faceScanned = button.classList[0];

            longPress = false;

            timer = setTimeout(() => {

                longPress = true;

                resetFace();

            }, 600);
        });

        button.addEventListener("pointerup", event => {

            if (event.button !== 0) {
                return;
            }

            clearTimeout(timer);
        });

        // SORTIE
        button.addEventListener("pointerleave", () => {

            clearTimeout(timer);
        });

        // ANNULATION
        button.addEventListener("pointercancel", () => {

            clearTimeout(timer);
        });

    });

    cameraInput.addEventListener("change", () => {
        const file = cameraInput.files[0];

        if (!file) {
            return;
        }

        const url = URL.createObjectURL(file);

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight
            );

            cropContainer.classList.add("show");
            URL.revokeObjectURL(url);
        };

        image.src = url;
    });

    function getAnchorImagePosition(anchor) {
        const cropRect = cameraCropBox.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();

        const screenX = anchorRect.left + anchorRect.width / 2;
        const screenY = anchorRect.top + anchorRect.height / 2;

        const cropX = screenX - cropRect.left;
        const cropY = screenY - cropRect.top;

        const localX = (cropX - x) / scale;
        const localY = (cropY - y) / scale;

        const imageWidth = image.clientWidth;
        const imageHeight = image.clientHeight;

        const imageRatio =
            image.naturalWidth / image.naturalHeight;

        const containerRatio =
            imageWidth / imageHeight;

        let displayedWidth;
        let displayedHeight;
        let offsetX;
        let offsetY;

        if (imageRatio > containerRatio) {
            displayedWidth = imageWidth;
            displayedHeight = imageWidth / imageRatio;
            offsetX = 0;
            offsetY = (imageHeight - displayedHeight) / 2;
        } else {
            displayedHeight = imageHeight;
            displayedWidth = imageHeight * imageRatio;
            offsetX = (imageWidth - displayedWidth) / 2;
            offsetY = 0;
        }

        return {
            x: (localX - offsetX) *
                image.naturalWidth / displayedWidth,

            y: (localY - offsetY) *
                image.naturalHeight / displayedHeight
        };
    }

    cropConfirm.addEventListener("click", () => {
        const scannedColors = [];

        anchors.forEach(anchor => {
            const position = getAnchorImagePosition(anchor);

            const color = getAverageColor(
                ctx,
                canvas,
                position.x,
                position.y,
                30
            );

            scannedColors.push(getPastelColor(color));
        });

        console.log(scannedColors);

        const face =
            scanBoxMap[layerToFace[`${faceScanned}Layer`]];

        if (faceScanned === "back") {
            for (let i = 8; i > -1; i--) {
                if (scannedColors[8 - i] !== null) {
                    face[i].color = scannedColors[8 - i].color;
                    face[i].colorId =
                        colors.indexOf(scannedColors[8 - i]);
                } else {
                    face[i].color = "rgb(0, 0, 0)";
                    face[i].colorId = null;
                }
            }
        } else {
            for (let i = 0; i < face.length; i++) {
                if (scannedColors[i] !== null) {
                    face[i].color = scannedColors[i].color;
                    face[i].colorId =
                        colors.indexOf(scannedColors[i]);
                } else {
                    face[i].color = "rgb(0, 0, 0)";
                    face[i].colorId = null;
                }
            }
        }

        updateBackground(
            scanBoxMap,
            true,
            [0, 1, 2, 3, 4, 5, 6, 7, 8]
        );

        cropContainer.classList.remove("show");

        document
            .querySelector(`button.${faceScanned}`)
            .classList.add("active");
    });

    function updateTransform() {
        image.style.transform =
            `translate(${x}px, ${y}px) scale(${scale})`;
    }

    cameraCropBox.addEventListener("pointerdown", event => {
        pointers.set(event.pointerId, event);

        if (pointers.size === 2) {
            isDragging = false;

            const [p1, p2] = pointers.values();

            lastDistance = Math.hypot(
                p2.clientX - p1.clientX,
                p2.clientY - p1.clientY
            );

            return;
        }

        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;

        cameraCropBox.setPointerCapture(event.pointerId);
    });

    cameraCropBox.addEventListener("pointermove", event => {
        pointers.set(event.pointerId, event);

        if (pointers.size === 2) {
            const [p1, p2] = pointers.values();

            const centerX =
                (p1.clientX + p2.clientX) / 2;
            const centerY =
                (p1.clientY + p2.clientY) / 2;

            const distance = Math.hypot(
                p2.clientX - p1.clientX,
                p2.clientY - p1.clientY
            );

            if (lastDistance !== null) {
                const oldScale = scale;

                scale *= distance / lastDistance;
                scale = Math.max(0.5, Math.min(scale, 8));

                const rect =
                    cameraCropBox.getBoundingClientRect();

                const pointX = centerX - rect.left;
                const pointY = centerY - rect.top;

                const imageX =
                    (pointX - x) / oldScale;
                const imageY =
                    (pointY - y) / oldScale;

                x = pointX - imageX * scale;
                y = pointY - imageY * scale;

                updateTransform();
            }

            lastDistance = distance;
            return;
        }

        if (!isDragging) {
            return;
        }

        x += event.clientX - lastX;
        y += event.clientY - lastY;

        lastX = event.clientX;
        lastY = event.clientY;

        updateTransform();
    });

    cameraCropBox.addEventListener("pointerup", event => {
        pointers.delete(event.pointerId);

        if (pointers.size < 2) {
            lastDistance = null;
        }

        isDragging = false;
    });

    cameraCropBox.addEventListener("pointercancel", event => {
        pointers.delete(event.pointerId);

        if (pointers.size < 2) {
            lastDistance = null;
        }

        isDragging = false;
    });

    cameraCropBox.addEventListener(
        "wheel",
        event => {
            if (!event.ctrlKey) {
                return;
            }

            event.preventDefault();

            const rect =
                cameraCropBox.getBoundingClientRect();

            const pointX = event.clientX - rect.left;
            const pointY = event.clientY - rect.top;

            const oldScale = scale;

            scale *= Math.exp(-event.deltaY * 0.001);
            scale = Math.max(0.5, Math.min(scale, 8));

            const imageX =
                (pointX - x) / oldScale;
            const imageY =
                (pointY - y) / oldScale;

            x = pointX - imageX * scale;
            y = pointY - imageY * scale;

            updateTransform();
        },
        { passive: false }
    );
}
