import { convertDriveLink } from '/Hobby-Gallery/shared/components/drive.js';

const SCALE_FACTOR = 5;
const MASONRY_UNIT = 10;
const MASONRY_GAP  = 10;

const DEFAULT_WIDTH  = 30 * SCALE_FACTOR;
const DEFAULT_HEIGHT = 30 * SCALE_FACTOR;

const PLACEHOLDERS = [
    "/Hobby-Gallery/assets/placeholders/dp/puzzle1.png",
    "/Hobby-Gallery/assets/placeholders/dp/puzzle2.png",
    "/Hobby-Gallery/assets/placeholders/dp/puzzle3.png",
    "/Hobby-Gallery/assets/placeholders/dp/puzzle4.png",
    "/Hobby-Gallery/assets/placeholders/dp/puzzle5.png",
    "/Hobby-Gallery/assets/placeholders/dp/puzzle6.png"
];

function dpDisplay()
{
    return document.getElementById("display");
}

function addHoverDelay(element, callback, delay = 750)
{
    const infoToggle = document.getElementById("infoToggle");
    let timer;

    element.addEventListener("mouseenter", () =>
    {
        if (!infoToggle.checked)
        {
            timer = setTimeout(() => callback(), delay);
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

export function renderDp(dpData)
{
    const display = dpDisplay();
    display.innerHTML = "";

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

        const imgWidth  = dp.Width  ? dp.Width  * SCALE_FACTOR : DEFAULT_WIDTH;
        const imgHeight = dp.Height ? dp.Height * SCALE_FACTOR : DEFAULT_HEIGHT;

        const isSmall = imgWidth < DEFAULT_WIDTH || imgHeight < DEFAULT_HEIGHT;

        if (isSmall)
        {
            card.style.width  = `${DEFAULT_WIDTH}px`;
            card.style.height = `${DEFAULT_HEIGHT}px`;
            cardFront.classList.add("name-default");
        }
        else
        {
            card.style.width  = `${imgWidth}px`;
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

            img.style.width  = `${imgWidth}px`;
            img.style.height = `${imgHeight}px`;
        }
        else
        {
            const img = document.createElement("img");
            img.classList.add("img-default");

            const randomIndex = Math.floor(Math.random() * PLACEHOLDERS.length);
            img.src = PLACEHOLDERS[randomIndex];

            img.style.width  = `${imgWidth}px`;
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

        const modifierContainer = document.createElement("div");
        modifierContainer.classList.add("modifier-btn-container");

        const modifierAB = document.createElement("div");
        modifierAB.classList.add("modifier-btn");
        modifierAB.textContent = "AB";
        applyModifierStyle(modifierAB, dp.AB === "TRUE");
        modifierContainer.appendChild(modifierAB);

        const modifierFD = document.createElement("div");
        modifierFD.classList.add("modifier-btn");
        modifierFD.textContent = "FD";
        applyModifierStyle(modifierFD, dp.FD === "TRUE");
        modifierContainer.appendChild(modifierFD);

        cardBack.appendChild(modifierContainer);

        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        display.appendChild(card);

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

    applyMasonry();
}

function applyModifierStyle(el, active)
{
    if (active)
    {
        el.style.backgroundColor = "#38005e";
        el.style.color = "white";
    }
    else
    {
        el.style.backgroundColor = "#ccc";
        el.style.color = "#666";
    }
}

export function applyMasonry()
{
    const display = dpDisplay();
    const cards = Array.from(display.querySelectorAll(".card"));
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
            card.style.gridRowEnd    = `span ${rowSpan}`;
        };

        const img = card.querySelector("img");

        if (img && !img.complete) img.onload = resize;
        else resize();
    });
}
