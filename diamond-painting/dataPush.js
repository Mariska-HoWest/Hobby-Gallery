
/* =======================
   /Hobby-Gallery/diamond-painting/dataPush.js
======================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydoJrx-yyU52QAAUr-MFB38oNL8jslRgAtNwzohQ7vG6uM-gxzKMdW3xUJTrudxs3u/exec";

const modal = document.getElementById("dp-modal");

let isSubmitting = false;

/* ======================================================
   INIT
====================================================== */
window.addEventListener("load", () =>
{
    initModalEvents();
    initDropdowns();
    initToggles();
    initPaintingSelect();
});

function initModalEvents()
{
    const btn = document.querySelector(".editDPbtn");

    btn.addEventListener("click", openModal);
}

function initDropdowns()
{
    const ownerSource = () => dpData.map(d => d.Owner).filter(Boolean);

    createDropdown(
    {
        input: "owner_input",
        list: "owner_list",
        source: ownerSource
    });

    createDropdown(
    {
        input: "edit_owner_input",
        list: "edit_owner_list",
        source: ownerSource
    });
}

function initToggles()
{
    document.querySelectorAll(".neonToggle").forEach(toggle =>
    {
        toggle.addEventListener("click", () =>
        {
            toggle.classList.toggle("active");
        });
    });
}

/* ======================================================
   PAINTING SELECT DROPDOWN (CUSTOM)
====================================================== */
function initPaintingSelect()
{
    const input = document.getElementById("edit_select_input");
    const list = document.getElementById("edit_select_list");

    if (!input || !list) return;

    function render()
    {
        list.innerHTML = "";

        if (!Array.isArray(dpData)) return;

        dpData.forEach(p =>
        {
            const item = document.createElement("div");

            item.textContent = `${p.ID ?? ""} - ${p.Name ?? "Unnamed"}`;
            item.dataset.id = p.ID ?? "";

            item.addEventListener("click", () =>
            {
                input.value = p.Name ?? "";
                input.dataset.value = String(p.ID ?? "");

                list.classList.add("hidden");
            });

            list.appendChild(item);
        });
    }

    input.addEventListener("click", () =>
    {
        list.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) =>
    {
        if (!input.contains(e.target) && !list.contains(e.target))
        {
            list.classList.add("hidden");
        }
    });

    render();
}

/* ======================================================
   MODAL CONTROL
====================================================== */
function openModal()
{
    modal.classList.remove("hidden");
    showAdd();
}

function closeModal()
{
    modal.classList.add("hidden");
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

    setToggle("add_ab", false);
    setToggle("add_fd", false);

    document.querySelectorAll(".dp-mode button").forEach(b => b.classList.remove("active"));
    document.querySelector(".dp-mode button:nth-child(1)").classList.add("active");
}

function showEditSelect()
{
    hideAll();
    document.getElementById("dp-edit-select").classList.remove("hidden");

    const input = document.getElementById("edit_select_input");
    const list = document.getElementById("edit_select_list");

    input.value = "";
    input.dataset.value = "";

    list.classList.add("hidden");

    document.querySelectorAll(".dp-mode button").forEach(b => b.classList.remove("active"));
    document.querySelector(".dp-mode button:nth-child(2)").classList.add("active");
}

function loadPainting()
{
    const id = document.getElementById("edit_select_input").dataset.value;
    if (!id) return;

    const dp = dpData.find(p => String(p.ID) === String(id));
    if (!dp) return;

    document.getElementById("edit_name").value = dp.Name || "";
    document.getElementById("edit_width").value = dp.Width || "";
    document.getElementById("edit_height").value = dp.Height || "";
    document.getElementById("edit_owner_input").value = dp.Owner || "";
    document.getElementById("edit_comment").value = dp.Comment || "";
    document.getElementById("edit_imgoriginal").value = dp.ImgOriginal || "";
    document.getElementById("edit_imgfinished").value = dp.ImgFinished || "";

    setToggle("edit_ab", isTrue(dp.AB));
    setToggle("edit_fd", isTrue(dp.FD));

    hideAll();
    document.getElementById("dp-edit").classList.remove("hidden");
}

/* ======================================================
   ADD PAINTING
====================================================== */
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
        ab: document.getElementById("add_ab").classList.contains("active"),
        fd: document.getElementById("add_fd").classList.contains("active"),
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

/* ======================================================
   EDIT PAINTING
====================================================== */
async function paintingEdit()
{
    if (isSubmitting) return;

    lockForm();

    const w = parseFloat(document.getElementById("edit_width").value) || 0;
    const h = parseFloat(document.getElementById("edit_height").value) || 0;

    const data =
    {
        action: "edit",
        id: document.getElementById("edit_select_input").dataset.value,
        name: document.getElementById("edit_name").value,
        width: w,
        height: h,
        owner: document.getElementById("edit_owner_input").value,
        sizem2: w * h,
        ab: document.getElementById("edit_ab").classList.contains("active"),
        fd: document.getElementById("edit_fd").classList.contains("active"),
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

/* ======================================================
   TOAST
====================================================== */
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

/* ======================================================
   FORM LOCK
====================================================== */
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

/* ======================================================
   TOGGLE HELPER
====================================================== */
function setToggle(id, state)
{
    const el = document.getElementById(id);

    if (state)
        el.classList.add("active");
    else
        el.classList.remove("active");
}