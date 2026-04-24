// =======================
// /Hobby-Gallery/diamond-painting/dataManipulation.js
// =======================

const dpDisplay = document.getElementById("display");
let dpData = [];

const SCALE_FACTOR = 5;
const MASONRY_UNIT = 10;
const MASONRY_GAP = 10;

const DEFAULT_WIDTH = 30*SCALE_FACTOR;
const DEFAULT_HEIGHT = 30*SCALE_FACTOR;

window.initManipulation = function(data) 
{
    dpData = Array.isArray(data) ? data : [];
    console.table(dpData);
    
    // NEW: Initialize the sort listeners so the buttons work
    SetupDPSortListeners();
    
    // Original Flow
    ApplyDPSorting(); // This replaces the old hardcoded sort
    CreateDpSideBar();
};

document.addEventListener("DOMContentLoaded", () =>
{
    SetupDPFilterButtons();
});

//#region Sorting & Search

function SetupDPSortListeners()
{
    const sortWrapper = document.getElementById("sort-wrapper");
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir = document.getElementById("sort-direction");
    const sortIcon = sortDir.querySelector("i");

    sortAttr.addEventListener("change", () =>
    {
        if (sortAttr.value === "default")
        {
            sortWrapper.classList.remove("is-active");
        }
        else
        {
            sortWrapper.classList.add("is-active");
        }
        ApplyDPSorting();
    });

    sortDir.addEventListener("click", () => 
    {
        const currentOrder = sortDir.getAttribute("data-order");
        const newOrder = currentOrder === "asc" ? "desc" : "asc";
        
        sortDir.setAttribute("data-order", newOrder);
        
        if (newOrder === "desc")
        {
            sortIcon.classList.replace("fa-arrow-up", "fa-arrow-down");
        }
        else
        {
            sortIcon.classList.replace("fa-arrow-down", "fa-arrow-up");
        }
        
        ApplyDPSorting();
    });
}

function ApplyDPSorting()
{
    const attribute = document.getElementById("sort-attribute").value;
    const order = document.getElementById("sort-direction").getAttribute("data-order");

    dpData.sort((a, b) =>
    {
        if (attribute === "default")
        {
            const areaDiff = (b.Width * b.Height) - (a.Width * a.Height);
            if (Math.abs(areaDiff) < 50)
                return Math.random() - 0.5;
            return areaDiff;
        }

        if (attribute === "size")
        {
            return (a.Width * a.Height) - (b.Width * b.Height);
        }

        if (attribute === "owner")
        {
            return (a.Owner || "").toLowerCase().localeCompare((b.Owner || "").toLowerCase());
        }

        // Name Sort
        return (a.Name || "").toLowerCase().localeCompare((b.Name || "").toLowerCase());
    });

    if (order === "desc" && attribute !== "default")
    {
        dpData.reverse();
    }

    updateDpDisplay();
}

//#endregion

//#region Original Logic (Untouched)

function addHoverDelay(element, callback, delay = 750)
{
    let timer;

    element.addEventListener("mouseenter", () =>
    {
        if (!infoToggle.checked)
        {
            timer = setTimeout(() =>
            {
                callback();
            }, delay);
        }
    });

    element.addEventListener("mouseleave", () =>
    {
        if (!infoToggle.checked)
        {
            clearTimeout(timer);
            element.querySelector(".card-inner").classList.remove("flipped");
        }
    });
}

function CreateDpSideBar()
{
    document.getElementById("infoToggle").addEventListener("change", (e) =>
    {
        const cards = document.querySelectorAll(".card-inner");
        cards.forEach((card, index) =>
        {
            setTimeout(() =>
            {
                if (e.target.checked)
                {
                    card.classList.add("flipped");
                }
                else
                {
                    card.classList.remove("flipped");
                }
            }, index * 25);
        });
    });
}

function SetupDPFilterButtons()
{
    const btnBefore = document.querySelector("#btnBefore");
    const btnDefault = document.querySelector("#btnDefault");
    const btnAfter = document.querySelector("#btnAfter");

    const buttons = [btnBefore, btnDefault, btnAfter];

    buttons.forEach(btn =>
    {
        btn.addEventListener("click", () =>
        {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (btn.id === "btnBefore") ShowBeforePictures();
            else if (btn.id === "btnDefault") ResetPictures();
            else if (btn.id === "btnAfter") ShowAfterPictures();
        });
    });

    if (btnDefault) btnDefault.classList.add("active");
}

function ShowBeforePictures() { /* ... same as your original ... */ }
function ResetPictures() { /* ... same as your original ... */ }
function ShowAfterPictures() { /* ... same as your original ... */ }

function updateDpDisplay()
{
    dpDisplay.innerHTML = "";

    dpData.forEach(dp =>
    {
        const card = document.createElement("div");
        card.classList.add("card");

        const cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");

        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");

        const name = document.createElement("div");
        name.classList.add("name");
        name.textContent = dp.Name;
        cardFront.appendChild(name);

        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img-container");

        const imgWidth = dp.Width ? dp.Width * SCALE_FACTOR : DEFAULT_WIDTH;
        const imgHeight = dp.Height ? dp.Height * SCALE_FACTOR : DEFAULT_HEIGHT;

        const isSmall = imgWidth < DEFAULT_WIDTH || imgHeight < DEFAULT_HEIGHT;

        if (isSmall) 
        {
            card.style.width = `${DEFAULT_WIDTH}px`;
            card.style.height = `${DEFAULT_HEIGHT}px`;
            cardFront.classList.add("name-default")
        }
        else 
        {
            card.style.width = `${imgWidth}px`;
            card.style.height = `${imgHeight}px`;
        }

        if (dp.ImgOriginal || dp.ImgFinished)
        {
            const img = document.createElement("img");
            img.classList.add("img");

            img.src = dp.ImgOriginal
                ? convertDriveLink(dp.ImgOriginal)
                : convertDriveLink(dp.ImgFinished);

            if (dp.ImgOriginal) img.dataset.original = convertDriveLink(dp.ImgOriginal);
            if (dp.ImgFinished) img.dataset.finished = convertDriveLink(dp.ImgFinished);

            imgContainer.appendChild(img);

            img.style.width = `${imgWidth}px`;
            img.style.height = `${imgHeight}px`;
        }
        else
        {
            cardFront.classList.add("no-image");
            imgContainer.style.height = `${DEFAULT_HEIGHT}px`;
        }

        cardFront.appendChild(imgContainer);
        cardInner.appendChild(cardFront);

        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");

        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = dp.Name;
        cardBack.appendChild(title);

        const infoPanel = document.createElement("div");
        infoPanel.classList.add("card-info");
        infoPanel.textContent = `Dimensions: ${dp.Width}x${dp.Height}\nOwner: ${dp.Owner}` + (dp.Comment ? `\nComment: ${dp.Comment}` : "");
        infoPanel.style.whiteSpace = "pre-wrap";
        cardBack.appendChild(infoPanel);

        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        dpDisplay.appendChild(card);

        if (dp.Finished === "TRUE")
        {
            const checkMark = document.createElement("div");
            checkMark.classList.add("finished-check");
            cardFront.appendChild(checkMark);
        }

        addHoverDelay(card, () => cardInner.classList.add("flipped"));
    });

    applyMasonryLayout();
}

function applyMasonryLayout()
{
    const cards = Array.from(dpDisplay.querySelectorAll(".card"));
    if (!cards.length) return;

    cards.forEach(card =>
    {
        const resize = () =>
        {
            const w = card.offsetWidth;
            const h = card.offsetHeight;

            const colSpan = Math.ceil((w + MASONRY_GAP) / (MASONRY_UNIT + MASONRY_GAP));
            const rowSpan = Math.ceil((h + MASONRY_GAP) / (MASONRY_UNIT + MASONRY_GAP));

            card.style.gridColumnEnd = `span ${colSpan}`;
            card.style.gridRowEnd = `span ${rowSpan}`;
        };

        const img = card.querySelector("img");

        if (img && !img.complete)
        {
            img.onload = resize;
        }
        else
        {
            resize();
        }
    });
}

//#endregion