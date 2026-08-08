import { convertDriveLink } from '/Hobby-Gallery/shared/components/drive.js';

let candleData = [];
let currentIndex = 0;
let modal, modalClose, modalPrev, modalNext;

export function initModal(data)
{
    candleData = data;

    modal      = document.getElementById("candleModal");
    modalClose = document.getElementById("modalClose");
    modalPrev  = document.getElementById("modalPrev");
    modalNext  = document.getElementById("modalNext");

    modalClose.addEventListener("click", closeModal);
    modal.querySelector(".modal-overlay").addEventListener("click", closeModal);

    modalNext.addEventListener("click", showNext);
    modalPrev.addEventListener("click", showPrev);

    document.addEventListener("keydown", (e) =>
    {
        if (modal.classList.contains("hidden")) return;

        if (e.key === "Escape")     closeModal();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft")  showPrev();
    });
}

export function openCandleModal(index)
{
    currentIndex = index;
    modal.classList.remove("hidden");
    renderModal();
}

function showNext()
{
    currentIndex = (currentIndex + 1) % candleData.length;
    renderModal();
}

function showPrev()
{
    currentIndex = (currentIndex - 1 + candleData.length) % candleData.length;
    renderModal();
}

function closeModal()
{
    modal.classList.add("hidden");
}

function renderModal()
{
    const candle = candleData[currentIndex];
    if (!candle) return;

    document.getElementById("modalName").textContent = candle.Name;
    document.getElementById("modalId").textContent   = `#${candle.ID || "??"}`;
    document.getElementById("modalImg").src          = convertDriveLink(candle.Img);

    document.getElementById("modalWeight").textContent  = `${candle.TotalWeight  || 0}g`;
    document.getElementById("modalCost").textContent    = `${candle.MaterialCost || 0}`;
    document.getElementById("modalMoulds").textContent  = candle.Moulds || 0;

    document.getElementById("modalDimensions").textContent =
        `${candle.Height}cm x ${candle.Diameter}cm (Wick: ${candle.Wick || "?"})`;

    const extrasList = document.getElementById("modalExtras");
    if (extrasList)
    {
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
}
