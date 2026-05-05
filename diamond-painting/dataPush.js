// =======================
// /Hobby-Gallery/diamond-painting/dataPush.js
// =======================

const modal = document.getElementById("dp-modal");

let isSubmitting = false;
let owners = [];

//#region Init
window.addEventListener("load", () =>
{
    initPush();
});

function initPush()
{
    initOwners();
    initDropdowns();
    initModalEvents();
}
//#endregion

//#region Data Init
function initOwners()
{
    owners = [...new Set(dpData.map(d => d.Owner).filter(Boolean))];
}
//#endregion

//#region Modal Control
function initModalEvents()
{
    const btn = document.querySelector(".editDPbtn");

    btn.addEventListener("click", () =>
    {
        openModal();
    });
}

function openModal()
{
    modal.classList.add("active");
    showAdd();
}

function closeModal()
{
    modal.classList.remove("active");
    hideAll();
}

function hideAll()
{
    document.querySelectorAll(".dp-section").forEach(s =>
    {
        s.classList.add("hidden");
    });
}

function showAdd()
{
    hideAll();
    document.getElementById("dp-add").classList.remove("hidden");
}

function showEditSelect()
{
    hideAll();
    document.getElementById("dp-edit-select").classList.remove("hidden");
}
//#endregion

//#region Dropdowns
function initDropdowns()
{
    createDropdown(
    {
        inputId: "owner_input",
        listId: "owner_list",
        sourceArray: owners,
        allowNewValues: true
    });

    createDropdown(
    {
        inputId: "edit_owner_input",
        listId: "edit_owner_list",
        sourceArray: owners,
        allowNewValues: true
    });
}
//#endregion

//#region Add Painting
async function paintingAdd()
{
    if (isSubmitting) return;

    lockForm();

    const w = parseFloat(document.getElementById("add_width").value) || 0;
    const h = parseFloat(document.getElementById("add_height").value) || 0;

    const data =
    {
        action: "add",
        id: Date.now().toString(),
        name: document.getElementById("add_name").value,
        width: w,
        height: h,
        owner: document.getElementById("owner_input").value,
        sizem2: w * h,
        ab: document.getElementById("add_ab").checked,
        fd: document.getElementById("add_fd").checked,
        comment: document.getElementById("add_comment").value,
        imgoriginal: document.getElementById("add_imgoriginal").value,
        imgfinished: document.getElementById("add_imgfinished").value
    };

    try
    {
        await fetch(SCRIPT_URL,
        {
            method: "POST",
            body: JSON.stringify(data)
        });

        showToast("Painting added");

        setTimeout(() =>
        {
            closeModal();
        }, 500);
    }
    finally
    {
        unlockForm();
    }
}
//#endregion

//#region Edit Painting
async function paintingEdit()
{
    if (isSubmitting) return;

    lockForm();

    const w = parseFloat(document.getElementById("edit_width").value) || 0;
    const h = parseFloat(document.getElementById("edit_height").value) || 0;

    const data =
    {
        action: "edit",
        id: document.getElementById("edit_select_dropdown").value,
        name: document.getElementById("edit_name").value,
        width: w,
        height: h,
        owner: document.getElementById("edit_owner_input").value,
        sizem2: w * h,
        ab: document.getElementById("edit_ab").checked,
        fd: document.getElementById("edit_fd").checked,
        comment: document.getElementById("edit_comment").value,
        imgoriginal: document.getElementById("edit_imgoriginal").value,
        imgfinished: document.getElementById("edit_imgfinished").value
    };

    try
    {
        await fetch(SCRIPT_URL,
        {
            method: "POST",
            body: JSON.stringify(data)
        });

        showToast("Painting updated");

        setTimeout(() =>
        {
            closeModal();
        }, 500);
    }
    finally
    {
        unlockForm();
    }
}
//#endregion

//#region Toast
function showToast(message)
{
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() =>
    {
        toast.classList.remove("show");

        setTimeout(() =>
        {
            toast.classList.add("hidden");
        }, 250);
    }, 2500);
}
//#endregion

//#region Form Lock
function lockForm()
{
    isSubmitting = true;

    document.querySelectorAll(".dp-modal input, .dp-modal button").forEach(el =>
    {
        el.disabled = true;
        el.style.opacity = "0.6";
        el.style.pointerEvents = "none";
    });
}

function unlockForm()
{
    isSubmitting = false;

    document.querySelectorAll(".dp-modal input, .dp-modal button").forEach(el =>
    {
        el.disabled = false;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
    });
}
//#endregion