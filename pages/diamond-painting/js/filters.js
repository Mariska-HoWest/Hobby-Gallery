import { isTrue } from '/Hobby-Gallery/shared/utils/booleans.js';
import { createDropdown } from '/Hobby-Gallery/shared/components/dropdown.js';

export function initFilters(dpData, onChange)
{
    const state = {
        owner: null,
        finished: null,
        ab: false,
        fd: false
    };

    function applyAll()
    {
        dpData.forEach(dp =>
        {
            const matchesFinished =
                state.finished === null
                    ? true
                    : (dp.Finished === "TRUE") === state.finished;

            const matchesOwner =
                !state.owner
                    ? true
                    : dp.Owner === state.owner;

            const matchesAB =
                !state.ab
                    ? true
                    : isTrue(dp.AB);

            const matchesFD =
                !state.fd
                    ? true
                    : isTrue(dp.FD);

            dp.__visible = matchesFinished && matchesOwner && matchesAB && matchesFD;
        });

        onChange();
    }

    setupInfoToggle();
    setupPictureToggle();
    setupFinishedFilter(applyAll, state);
    setupOwnerFilter(applyAll, state, dpData);
    setupModifierFilter(applyAll, state);

    applyAll();
}

function setupInfoToggle()
{
    document.getElementById("infoToggle").addEventListener("change", (e) =>
    {
        const cards = document.querySelectorAll(".card-inner");

        cards.forEach((card, index) =>
        {
            setTimeout(() =>
            {
                if (e.target.checked) card.classList.add("flipped");
                else card.classList.remove("flipped");
            }, index * 25);
        });
    });
}

function setupPictureToggle()
{
    const btnBefore  = document.querySelector("#btnBefore");
    const btnDefault = document.querySelector("#btnDefault");
    const btnAfter   = document.querySelector("#btnAfter");

    const buttons = [btnBefore, btnDefault, btnAfter];

    buttons.forEach(btn =>
    {
        btn.addEventListener("click", () =>
        {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (btn.id === "btnBefore")        showBeforePictures();
            else if (btn.id === "btnDefault")  resetPictures();
            else if (btn.id === "btnAfter")    showAfterPictures();
        });
    });

    btnDefault.classList.add("active");
    resetPictures();
}

function showBeforePictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.original) img.src = img.dataset.original;
    });
}

function resetPictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.isFinished === "true" && img.dataset.finished)
            img.src = img.dataset.finished;
        else if (img.dataset.original)
            img.src = img.dataset.original;
    });
}

function showAfterPictures()
{
    document.querySelectorAll(".card-front .img").forEach(img =>
    {
        if (img.dataset.finished) img.src = img.dataset.finished;
    });
}

function setupFinishedFilter(applyAll, state)
{
    const btnUnFinished = document.querySelector("#btnUnFinished");
    const btnAll        = document.querySelector("#btnAll");
    const btnFinished   = document.querySelector("#btnFinished");

    const buttons = [btnUnFinished, btnAll, btnFinished];

    buttons.forEach(btn =>
    {
        btn.addEventListener("click", () =>
        {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (btn === btnUnFinished)    state.finished = false;
            else if (btn === btnFinished) state.finished = true;
            else                          state.finished = null;

            applyAll();
        });
    });

    btnAll.classList.add("active");
}

function setupOwnerFilter(applyAll, state, dpData)
{
    const container = document.querySelector(".nameFilter");
    const input     = container.querySelector(".nameFilter-input");
    const list      = container.querySelector(".nameFilter-list");

    createDropdown({
        input,
        list,
        source: () => dpData.map(d => d.Owner).filter(Boolean),
        includeAllOption: true,
        onSelect: (name) =>
        {
            container.classList.toggle("is-active", !!name);
            state.owner = name;
            applyAll();
        }
    });
}

function setupModifierFilter(applyAll, state)
{
    const btnAB = document.querySelector("#filterAB");
    const btnFD = document.querySelector("#filterFD");

    btnAB.addEventListener("click", () =>
    {
        state.ab = !state.ab;
        btnAB.classList.toggle("active", state.ab);
        applyAll();
    });

    btnFD.addEventListener("click", () =>
    {
        state.fd = !state.fd;
        btnFD.classList.toggle("active", state.fd);
        applyAll();
    });
}
