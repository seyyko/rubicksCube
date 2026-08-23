export function createPopup(popupId, title, id, desc, btns){
    const popup = document.getElementById("popup");
    popup.classList.remove(...popup.classList);
    popup.classList.add(popupId);
    popup.querySelector(".title").textContent = title
    popup.querySelector(".id p:nth-of-type(1)").textContent = id[0]
    popup.querySelector(".id p:nth-of-type(2)").textContent = id[1]
    if (desc === null){
        const desc = popup.querySelector(".desc");
        popup.classList.add("noDesc");
    }else{
        popup.querySelector(".desc p:nth-of-type(1)").textContent = desc[0]
        popup.querySelector(".desc p:nth-of-type(2)").textContent = desc[1]
    }
    if (btns){
        for (let i = 0; i < btns.length; i++) {
            const btn = popup.querySelector(`button:nth-of-type(${i+1})`);
            if (btns[i] === ""){
                btn.style.display = "none";
                popup.classList.add("singleBtn");
                continue;
            }
            btn.querySelector("b").textContent = btns[i]  
        }
    }
}