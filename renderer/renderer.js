
console.log("renderer.js loaded");

window.addEventListener("DOMContentLoaded",()=>{
    console.log("Dom ready");

    const layout = document.getElementById("layout");
    const btnSidebar=document.getElementById("btnSidebar");

    if (!layout || !btnSidebar) {
    console.error("layout 또는 btnSidebar를 찾지 못했습니다.");
    return;
    }

    btnSidebar.addEventListener("click",()=>{
        layout.classList.toggle("collapsed");
    });

});


