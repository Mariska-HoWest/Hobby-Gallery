const dpDisplay = document.getElementById("display");

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const SCALE_FACTOR = 5;
const CARD_GAP = 10;

document.addEventListener("DOMContentLoaded", () =>
{
    SetupFilterButtons();
});

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

function CreateSideBar()
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

function SetupFilterButtons()
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

function updateDpDisplay()
{
    dpDisplay.innerHTML = "";

    const cards = [];

    diamondData.forEach(dp =>
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

        if (dp.ImgOriginal || dp.ImgFinished)
        {
            const img = document.createElement("img");
            img.classList.add("img");
            img.src = dp.ImgOriginal ? convertDriveLink(dp.ImgOriginal) : convertDriveLink(dp.ImgFinished);
            if (dp.ImgOriginal) img.dataset.original = convertDriveLink(dp.ImgOriginal);
            if (dp.ImgFinished) img.dataset.finished = convertDriveLink(dp.ImgFinished);

            imgContainer.appendChild(img);

            img.style.width = dp.Width ? `${dp.Width * SCALE_FACTOR}px` : `${DEFAULT_WIDTH}px`;
            img.style.height = dp.Height ? `${dp.Height * SCALE_FACTOR}px` : `${DEFAULT_HEIGHT}px`;
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
        cards.push(card);

        addHoverDelay(card, () => cardInner.classList.add("flipped"));
    });

    const allImages = dpDisplay.querySelectorAll("img");
    const promises = Array.from(allImages).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)
    );

    Promise.all(promises).then(() =>
    {
        setTimeout(() =>
        {
            applyMasonryLayout();
        }, 50);
    });
}

function applyMasonryLayout()
{
    const cards = Array.from(dpDisplay.querySelectorAll(".card"));
    if (!cards.length) return;

    const rowHeight = 10;
    const rowGap = 10;

    cards.forEach(card =>
    {
        card.style.gridRowEnd = "span 1"; // reset

        // force browser to compute height
        const cardHeight = card.scrollHeight;

        const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));
        card.style.gridRowEnd = `span ${rowSpan}`;
    });
}


