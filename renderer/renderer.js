console.log("renderer.js loaded");

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready");

    const layout = document.getElementById("layout");
    const btnSidebar = document.getElementById("btnSidebar");
    const viewRoot = document.getElementById("view");

    if (!layout || !btnSidebar || !viewRoot) {
        console.error("layout / btnSidebar / viewRoot 중 하나를 찾지 못했습니다.");
        return;
    }

    // sidebar toggle
    btnSidebar.addEventListener("click", () => {
        layout.classList.toggle("collapsed");
    });

    async function loadView(name) {
        const res = await fetch(`./views/${name}.html`);
        const html = await res.text();

        viewRoot.innerHTML = html;

        // DOM이 실제로 붙은 뒤 실행
        requestAnimationFrame(() => {
            if (name === "excel") initExcelView();
            if (name === "review") initReviewView();
            if (name === "geo") initGeoView();
        });
    }

    // nav routing
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
        e.preventDefault();
        const name = link.dataset.view;

        document.querySelectorAll(".nav-item").forEach((li) => li.classList.remove("active"));
        link.closest(".nav-item")?.classList.add("active");

        loadView(name);
        localStorage.setItem("currentView", name);
        });
    });

    

    // first load
    const saved = localStorage.getItem("currentView") || "excel";
    loadView(saved);

    // active sync
    document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.dataset.view === saved) {
        document.querySelectorAll(".nav-item").forEach((li) => li.classList.remove("active"));
        link.closest(".nav-item")?.classList.add("active");
        }
    });
    });

    // ✅ JSON 로드 (renderer에서 fetch 방식)
    async function loadJSON(path) {
    const res = await fetch(path);
    return await res.json();
    }

function initExcelView() {
    console.log("initExcelView called");

    // ===== elements =====
    const uploadBtn = document.getElementById("btnUploadExcel");
    const pathBox = document.getElementById("excelPath");

    const createBtn = document.getElementById("btnCreateTemplate");
    const modal = document.getElementById("templateModal");
    const closeBtn = document.getElementById("btnCloseModal");
    const cancelBtn = document.getElementById("btnCancelTemplate");
    const confirmBtn = document.getElementById("btnConfirmTemplate");
    const mediaBlock = document.getElementById("mediaBlock");
    const templateInfo = document.getElementById("templateInfo");
    const typeSegment = document.getElementById("typeSegment");

    const selProject = document.getElementById("selProject");
    const txtYear = document.getElementById("txtProjectYear");
    const txtOrder = document.getElementById("txtProjectOrder");

    const selInstitution = document.getElementById("selInstitution");
    const txtInstitutionCode = document.getElementById("txtInstitutionCode");

    const txtTaxonCode = document.getElementById("txtTaxonCode");
    const btnMakeTemplate = document.getElementById("btnMakeTemplate");

    console.log("selProject:", selProject, "selInstitution:", selInstitution);

    // ===== state =====
    let selectedType = "specimen"; // 기본: 표본
    let projects = [];
    let institutions = [];

    // ===== helpers =====
    function syncTemplateConfigLive() {
        let mediaType = null;
        if (selectedType === "observation") {
            const checked = document.querySelector("input[name='mediaType']:checked");
            mediaType = checked ? checked.value : "OB";
        }
        window.__templateConfig = { type: selectedType, mediaType };

        if (templateInfo) {
            templateInfo.textContent =
            selectedType === "observation"
                ? `템플릿 설정: 관찰 (${mediaType})`
                : `템플릿 설정: 표본`;
        }
    }

    function enableForm(enabled) {
    if (selProject) selProject.disabled = !enabled;
    if (selInstitution) selInstitution.disabled = !enabled;
    console.log("enableForm:", enabled, "selProject.disabled:", selProject?.disabled);
    }

    function updateMakeButton() {
    const ok =
        window.__templateConfig &&
        (selProject?.value ?? "") !== "" &&
        (selInstitution?.value ?? "") !== "" &&
        (txtTaxonCode?.value || "").trim().length > 0;

    if (btnMakeTemplate) btnMakeTemplate.disabled = !ok;
    }

    function openModal() { 
        modal?.classList.remove("hidden");
        syncTemplateConfigLive();
        enableForm(true);
        updateMakeButton();
    }
    function closeModal() { modal?.classList.add("hidden"); }

    function updateMediaUI() {
    if (selectedType === "observation") mediaBlock?.classList.remove("hidden");
    else mediaBlock?.classList.add("hidden");
    }

    function applyProjectByIndex(idxStr) {
    const idx = Number(idxStr);
    const p = projects[idx];
    if (!p) return;
    if (txtYear) txtYear.value = p.year;
    if (txtOrder) txtOrder.value = p.order;
    }

    // ===== upload =====
    uploadBtn?.addEventListener("click", async () => {
    const filePath = await window.api.openExcelDialog();
    if (!filePath) {
        if (pathBox) pathBox.textContent = "선택된 파일 : 없음";
        return;
    }
    if (pathBox) pathBox.textContent = `선택된 파일 : ${filePath}`;
    console.log("selected Excel:", filePath);
    });

    // ===== modal events =====
    createBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.close === "1") closeModal();
    });

    document.querySelectorAll("input[name='mediaType']").forEach((r) => {
            r.addEventListener("change", () => {
            syncTemplateConfigLive();
            updateMakeButton();
        });
        });

    typeSegment?.addEventListener("click", (e) => {
        const btn = e.target.closest(".seg-btn");
        if (!btn) return;

        selectedType = btn.dataset.type;
        typeSegment.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        updateMediaUI();
        syncTemplateConfigLive();
        updateMakeButton();
    });

    confirmBtn?.addEventListener("click", () => {
    let mediaType = null;

    if (selectedType === "observation") {
        const checked = document.querySelector("input[name='mediaType']:checked");
        mediaType = checked ? checked.value : "OB";
        if (templateInfo) templateInfo.textContent = `템플릿 설정: 관찰 (${mediaType})`;
    } else {
        if (templateInfo) templateInfo.textContent = `템플릿 설정: 표본`;
    }

    window.__templateConfig = { type: selectedType, mediaType };
    console.log("templateConfig:", window.__templateConfig);



    updateMakeButton();
    closeModal();
    });

    // ===== form events =====
    selInstitution?.addEventListener("change", () => {
    if (txtInstitutionCode) txtInstitutionCode.value = selInstitution.value;
    updateMakeButton();
    });

    selProject?.addEventListener("change", () => {
    applyProjectByIndex(selProject.value);
    updateMakeButton();
    });

    txtTaxonCode?.addEventListener("input", updateMakeButton);

    // ===== init =====
    updateMediaUI();

    // 처음엔 템플릿 유형 선택 전이므로 비활성 (초기 1회)
    enableForm(false);
    updateMakeButton();

    // JSON 로드 & select 채우기 (중복 없이 1회)
    (async () => {
    try {
        institutions = await loadJSON("./data/institutions.json");
        projects = await loadJSON("./data/projects.json");

        // 기관 옵션 채우기
        if (selInstitution) {
        selInstitution.innerHTML = institutions
            .map((i) => `<option value="${i.code}">${i.name}</option>`)
            .join("");
        if (txtInstitutionCode) txtInstitutionCode.value = selInstitution.value;
        }

        // 사업 옵션 채우기 (value=index)
        if (selProject) {
        selProject.innerHTML = projects
            .map((p, idx) => `<option value="${idx}">${p.name}</option>`)
            .join("");
        applyProjectByIndex(selProject.value);
        }

        console.log("selects populated");
        // ✅ 여기서는 enableForm(false)를 다시 호출하지 말 것!
        // (confirm에서 true로 바꾼 걸 다시 꺼버리는 원인)
    } catch (err) {
        console.error("JSON load failed:", err);
    }
    })();



}

function initReviewView() {}
function initGeoView() {}

