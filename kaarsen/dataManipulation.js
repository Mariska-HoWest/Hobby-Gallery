// =======================
// /Hobby-Gallery/kaarsen/dataManipulation.js
// =======================

//Config
const candleDisplay = document.getElementById("display");

    //Modal
    const modal = document.getElementById("candleModal");
    const modalClose = document.getElementById("modalClose");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");

//States
let candleData = [];
let currentCandleIndex = 0;

//#region Init Flow
window.initCandleManipulation = function (data) 
{
    console.log('🟢 initCandleManipulation received:', Array.isArray(data) ? data.length : 0, 'rows');
    candleData = Array.isArray(data) ? data : [];

    SetUpCandleSorting();
    ApplySorting();
};
//#endregion

//#region View Transforms
function SetUpCandleSorting()
{
    const sortWrapper = document.getElementById("sort-wrapper");
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir = document.getElementById("sort-direction");
    const sortIcon = sortDir.querySelector("i");

    sortAttr.addEventListener("change", () =>
    {
        sortAttr.value === "default" 
            ? sortWrapper.classList.remove("is-active") 
            : sortWrapper.classList.add("is-active");

        ApplySorting();
    });

    sortDir.addEventListener("click", () => 
    {
        const currentOrder = sortDir.getAttribute("data-order");
        
        if (currentOrder === "asc") 
        {
            // Switch to DESC
            sortDir.setAttribute("data-order", "desc");
            sortIcon.classList.remove("fa-arrow-up");
            sortIcon.classList.add("fa-arrow-down");
        } 
        else 
        {
            // Switch to ASC
            sortDir.setAttribute("data-order", "asc");
            sortIcon.classList.remove("fa-arrow-down");
            sortIcon.classList.add("fa-arrow-up");
        }

        ApplySorting();
    });
}

function ApplySorting()
{
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir = document.getElementById("sort-direction");
    
    const attribute = sortAttr.value;
    const order = sortDir.getAttribute("data-order");

    candleData.sort((a, b) => 
    {
        let valA, valB;

        if (attribute === "default") 
        {
            const idA = a.ID;
            const idB = b.ID;

            // Check if numbers
            const isNumA = !isNaN(parseFloat(idA)) && isFinite(idA);
            const isNumB = !isNaN(parseFloat(idB)) && isFinite(idB);

            // Strings to front
            if (!isNumA && isNumB) return -1;
            if (isNumA && !isNumB) return 1;

            // both strings, sort alphabetically
            if (!isNumA && !isNumB) 
            {
                return String(idA).localeCompare(String(idB));
            }

            // both numbers, sort mathematically
            return parseFloat(idA) - parseFloat(idB);
        }

        if (attribute === "weight") 
        {
            valA = parseFloat(a.TotalWeight) || 0;
            valB = parseFloat(b.TotalWeight) || 0;
            return valA - valB;
        } 
        else //Name Sort
        {
            valA = (a.Name || "").toLowerCase();
            valB = (b.Name || "").toLowerCase();
            return valA.localeCompare(valB);
        }
    });

    // if desc, flip array
    if (order === "desc") 
    {
        candleData.reverse();
    }

    UpdateCandleDisplay();
}
//#endregion

//#region Interact Helpers
function openCandleModal(index)
{
    currentCandleIndex = index;
    modal.classList.remove("hidden");
    renderModal();
}

function showNext()
{
    currentCandleIndex = (currentCandleIndex + 1) % candleData.length;
    renderModal();
}

function showPrev()
{
    currentCandleIndex =
        (currentCandleIndex - 1 + candleData.length) % candleData.length;
    renderModal();
}

function closeModal()
{
    modal.classList.add("hidden");
}

// ===== Events =====
modalClose.addEventListener("click", closeModal);
modal.querySelector(".modal-overlay").addEventListener("click", closeModal);

modalNext.addEventListener("click", showNext);
modalPrev.addEventListener("click", showPrev);

// Keyboard support
document.addEventListener("keydown", (e) =>
{
    if (modal.classList.contains("hidden")) return;

    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
});
//#endregion

//#region Rendering Engine
function UpdateCandleDisplay()
{
    candleDisplay.innerHTML = "";

    candleData.forEach((candle, index) =>
    {
        const card = document.createElement('div');
        card.classList.add('card');

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = candle.Name;
        card.appendChild(title);

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const img = document.createElement('img');
        img.classList.add('img');
        img.src = convertDriveLink(candle.Img);

        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        // ✅ attach modal here
        card.addEventListener("click", () =>
        {
            openCandleModal(index);
        });

        candleDisplay.appendChild(card);
    });
}

function renderModal()
{
    const candle = candleData[currentCandleIndex];
    if (!candle) return;

    document.getElementById("modalName").textContent = candle.Name;
    document.getElementById("modalId").textContent = `#${candle.ID || "??"}`;
    document.getElementById("modalImg").src = convertDriveLink(candle.Img);

    document.getElementById("modalWeight").textContent = `${candle.TotalWeight || 0}g`;
    document.getElementById("modalCost").textContent = `${candle.MaterialCost || 0}`;
    document.getElementById("modalMoulds").textContent = candle.Moulds || 0;

    document.getElementById("modalDimensions").textContent =
        `${candle.Height}cm x ${candle.Diameter}cm (Wick: ${candle.Wick || "?"})`;

    const extrasList = document.getElementById("modalExtras");
    extrasList.innerHTML = "";

    if (candle.Extras)
    {
        candle.Extras.split(",").forEach(extra =>
        {
            const li = document.createElement("li");
            li.textContent = extra.trim();
            extrasList.appendChild(li);
        });
    }
}
//#endregion
