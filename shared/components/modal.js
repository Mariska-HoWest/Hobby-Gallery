let toastEl = null;
let toastTimer = null;

function ensureToast()
{
    if (toastEl) return toastEl;

    toastEl = document.getElementById("toast");

    if (!toastEl)
    {
        toastEl = document.createElement("div");
        toastEl.id = "toast";
        toastEl.className = "toast hidden";
        document.body.appendChild(toastEl);
    }

    return toastEl;
}

export function showToast(message, durationMs = 2500)
{
    const el = ensureToast();

    el.textContent = message;
    el.classList.remove("hidden");
    el.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() =>
    {
        el.classList.remove("show");
        setTimeout(() => el.classList.add("hidden"), 250);
    }, durationMs);
}
