export async function createPopup(popupId, title, id, desc, btns){
    const popup = document.getElementById("popup");
    popup.classList.remove(...popup.classList);
    popup.classList.add(popupId, "show");

    popup.querySelector(".title").textContent = title

    if (id){
        popup.querySelector(".id p:nth-of-type(1)").textContent = id[0]
        popup.querySelector(".id p:nth-of-type(2)").textContent = id[1]
    }else{
        const desc = popup.querySelector(".id");
        popup.classList.add("noId");
    }
    
    if (desc){
        popup.querySelector(".desc p:nth-of-type(1)").textContent = desc[0]
        popup.querySelector(".desc p:nth-of-type(2)").textContent = desc[1]
    }else{
        const desc = popup.querySelector(".desc");
        popup.classList.add("noDesc");
    }

    if (btns){
        for (let i = 0; i < btns.length; i++) {
            const btn = popup.querySelector(`button:nth-of-type(${i+1})`);
            if (btns[i] === null){
                btn.classList.add("hide");
                popup.classList.add("singleBtn");
                continue;
            }
            btn.classList.remove("hide");
            btn.querySelector("b").textContent = btns[i]  
        }
    }

    return await getPopupResponse(popupId);
}

function getPopupResponse(popupId) {
    return new Promise((resolve) => {
        const popup = document.querySelector(`#popup.${popupId}`);

        const handler = (e) => {
            const button = e.target.closest("button");

            if (!button) return;

            popup.classList.remove("show");

            const result = button.classList.contains("yesBtn");
            popup.removeEventListener("click", handler);
            resolve(result);
        };

        popup.addEventListener("click", handler);
    });
}