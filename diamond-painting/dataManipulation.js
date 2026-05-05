// =======================
// /Hobby-Gallery/diamond-painting/dataManipulation.js
// =======================

//Config
const dpDisplay = document.getElementById("display");

const SCALE_FACTOR = 5;
const MASONRY_UNIT = 10;
const MASONRY_GAP = 10;

const DEFAULT_WIDTH = 30*SCALE_FACTOR;
const DEFAULT_HEIGHT = 30*SCALE_FACTOR;

//States
let dpData = [];

let currentOwnerFilter = null;
let currentFinishedFilter = null;
let currentABFilter = false;
let currentFDFilter = false;

//#region Init Flow
function initManipulation(data) 
{
    dpData = Array.isArray(data) ? data : [];
    dpData.sort((a, b) =>
{
    const areaDiff = (b.Width * b.Height) - (a.Width * a.Height);
    if (Math.abs(areaDiff) < 50)
        return Math.random() - 0.5;
    return areaDiff;
});

    dpData.forEach(dp => dp.__visible = true);
    updateDpDisplay();
    requestAnimationFrame(applyMasonryLayout);
    SetUpUI();
}

function SetUpUI()
{
    SetUpDpFilters();
    setupEditButton();
}
//#endregion

//#region View Transforms
function SetUpDpFilters()
{
    SetupInfoToggle();
    SetupPictureToggle();
    SetupFinishedFilter();
    SetupOwnerFilter();
    SetupModifierFilter();
}

function SetupInfoToggle()
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

function SetupFinishedFilter()
{
    const btnUnFinished = document.querySelector("#btnUnFinished");
    const btnAll = document.querySelector("#btnAll");
    const btnFinished = document.querySelector("#btnFinished");

    const buttons = [btnUnFinished, btnAll, btnFinished];

    buttons.forEach(btn =>
    {
        btn.addEventListener("click", () =>
        {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (btn === btnUnFinished)
            {
                applyFinishedFilter(false);
            }
            else if (btn === btnFinished)
            {
                applyFinishedFilter(true);
            }
            else //show all
            {
                applyFinishedFilter(null);
            }
        });
    });

    btnAll.classList.add("active");
    applyFinishedFilter(null);
}

function SetupOwnerFilter()
{
    const container = document.querySelector(".nameFilter");
    const input = container.querySelector(".nameFilter-input");
    const list = container.querySelector(".nameFilter-list");

    const allOption = "All";

    const owners = [...new Set(dpData.map(d => d.Owner).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));

    let filtered = [];
    let activeIndex = -1;

    function render()
    {
        const displayList = [allOption, ...filtered];

        list.innerHTML = "";

        if (!displayList.length)
        {
            list.classList.add("hidden");
            return;
        }

        displayList.forEach((name, i) =>
        {
            const li = document.createElement("li");
            li.textContent = name;

            if (i === activeIndex) li.classList.add("active");

            li.addEventListener("click", () =>
            {
                input.value = name;
                list.classList.add("hidden");

                if (name === allOption)
                {
                    container.classList.remove("is-active");
                    input.value = "";
                    applyOwnerFilter(null);
                }
                else
                {
                    container.classList.add("is-active");
                    applyOwnerFilter(name);
                }
            });

            list.appendChild(li);
        });

        list.classList.remove("hidden");
    }

    input.addEventListener("input", () =>
    {
        const val = input.value.toLowerCase();

        filtered = owners.filter(o =>
            o.toLowerCase().includes(val)
        );

        activeIndex = -1;
        render();
    });

    input.addEventListener("keydown", (e) =>
    {
        const displayList = [allOption, ...filtered];

        if (!displayList.length) return;

        if (e.key === "ArrowDown")
        {
            activeIndex = (activeIndex + 1) % displayList.length;
            render();
        }

        if (e.key === "ArrowUp")
        {
            activeIndex = (activeIndex - 1 + displayList.length) % displayList.length;
            render();
        }

        if (e.key === "Enter" && displayList[activeIndex])
        {
            const name = displayList[activeIndex];

            input.value = name;
            list.classList.add("hidden");

            if (name === allOption)
            {
                container.classList.remove("is-active");
                input.value = "";
                applyOwnerFilter(null);
            }
            else
            {
                container.classList.add("is-active");
                applyOwnerFilter(name);
            }
        }

        if (e.key === "Escape")
        {
            list.classList.add("hidden");
        }
    });

    input.addEventListener("focus", () =>
    {
        filtered = [...owners];
        activeIndex = -1;
        render();
    });

    document.addEventListener("click", (e) =>
    {
        if (!container.contains(e.target))
        {
            list.classList.add("hidden");
        }
    });
}

function SetupModifierFilter()
{
    const btnAB = document.querySelector("#filterAB");
    const btnFD = document.querySelector("#filterFD");

    btnAB.addEventListener("click", () =>
    {
        currentABFilter = !currentABFilter;
        btnAB.classList.toggle("active", currentABFilter);
        applyAllFilters();
    });

    btnFD.addEventListener("click", () =>
    {
        currentFDFilter = !currentFDFilter;
        btnFD.classList.toggle("active", currentFDFilter);
        applyAllFilters();
    });
}

function SetupPictureToggle()
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

    btnDefault.classList.add("active");
    ResetPictures();
}

function ShowBeforePictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.original) img.src = img.dataset.original;
    });
}

function ResetPictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.isFinished === "true" && img.dataset.finished)
        {
            img.src = img.dataset.finished;
        }
        else if (img.dataset.original)
        {
            img.src = img.dataset.original;
        }
    });
}

function ShowAfterPictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.finished) img.src = img.dataset.finished;
    });
}

function applyFinishedFilter(state)
{
    currentFinishedFilter = state;
    applyAllFilters();
}

function applyOwnerFilter(owner)
{
    currentOwnerFilter = owner;
    applyAllFilters();
}

function applyAllFilters()
{
    dpData.forEach(dp =>
    {
        const matchesFinished =
            currentFinishedFilter === null
                ? true
                : (dp.Finished === "TRUE") === currentFinishedFilter;

        const matchesOwner =
            !currentOwnerFilter
                ? true
                : dp.Owner === currentOwnerFilter;

        const matchesAB =
            !currentABFilter
                ? true
                : isTrue(dp.AB);

        const matchesFD =
            !currentFDFilter
                ? true
                : isTrue(dp.FD);

        dp.__visible =
        matchesFinished &&
        matchesOwner &&
        matchesAB &&
        matchesFD;
            });

    updateDpDisplay();
    applyMasonryLayout();
}
//#endregion

//#region Interact Helpers
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

function setupEditButton()
{
    const btn = document.querySelector(".editDPbtn");

    if (!btn) return;

    btn.addEventListener("click", () =>
    {
        window.location.href = "./edit.html";
    });
}

function isTrue(value)
{
    return String(value).trim().toLowerCase() === "true"
        || String(value).trim().toLowerCase() === "waar";
}
//#endregion

//#region Rendering Engine
function updateDpDisplay()
{
    dpDisplay.innerHTML = "";

    dpData.filter(dp => dp.__visible !== false).forEach(dp =>
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

    // Calculate scaled image size
    const imgWidth = dp.Width ? dp.Width * SCALE_FACTOR : DEFAULT_WIDTH;
    const imgHeight = dp.Height ? dp.Height * SCALE_FACTOR : DEFAULT_HEIGHT;

    const isSmall = imgWidth < DEFAULT_WIDTH || imgHeight < DEFAULT_HEIGHT;

    if (isSmall) 
        {
        // Small card → use defaults
        card.style.width = `${DEFAULT_WIDTH}px`;
        card.style.height = `${DEFAULT_HEIGHT}px`;
        cardFront.classList.add("name-default")
        }
        else 
        {
        // Big card → use scaled size
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
        const img = document.createElement("img");
        img.classList.add("img-default");

        const placeholders = 
        [
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle1.png",
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle2.png",
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle3.png",
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle4.png",
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle5.png",
            "/Hobby-Gallery/Assets/DP_PlaceHolderPuzzle5.png"
        ];

        const randomIndex = Math.floor(Math.random() * placeholders.length);
        img.src = placeholders[randomIndex];

        img.style.width = `${imgWidth}px`;
        img.style.height = `${imgHeight}px`;

        imgContainer.appendChild(img);
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

                    let modifierContainer = document.createElement("div");
            modifierContainer.classList.add("modifier-btn-container");

                let modifierAB = document.createElement("div");
                modifierAB.classList.add("modifier-btn");
                modifierAB.textContent = "AB";

                    if(dp.AB === "TRUE") 
                    {
                        modifierAB.style.backgroundColor = "#38005e"; // active color
                        modifierAB.style.color = "white";
                    }
                    else 
                    {
                        modifierAB.style.backgroundColor = "#ccc";     // inactive color
                        modifierAB.style.color = "#666";
                    }
                modifierContainer.appendChild(modifierAB);

                let modifierFD = document.createElement("div");
                modifierFD.classList.add("modifier-btn");
                modifierFD.textContent = "FD";

                    if(dp.FD === "TRUE") 
                    {
                        modifierFD.style.backgroundColor = "#38005e"; // active color
                        modifierFD.style.color = "white";
                    }
                    else 
                    {
                        modifierFD.style.backgroundColor = "#ccc";     // inactive color
                        modifierFD.style.color = "#666";
                    }
                modifierContainer.appendChild(modifierFD);

            cardBack.appendChild(modifierContainer);

        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        dpDisplay.appendChild(card);

    if (dp.Finished === "TRUE")
    {
        const wrapper = document.createElement("div");
        wrapper.classList.add("finished-check");

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-square-check");

        wrapper.appendChild(icon);
        cardFront.appendChild(wrapper);
    }

        addHoverDelay(card, () => cardInner.classList.add("flipped"));
    });

    applyMasonryLayout();
}
//#endregion

//#region Lay-out Engine
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
