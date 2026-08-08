export function setupSorting(candleData, onChange)
{
    const sortWrapper = document.getElementById("sort-wrapper");
    const sortAttr    = document.getElementById("sort-attribute");
    const sortDir     = document.getElementById("sort-direction");
    const sortIcon    = sortDir.querySelector("i");

    sortAttr.addEventListener("change", () =>
    {
        sortAttr.value === "default"
            ? sortWrapper.classList.remove("is-active")
            : sortWrapper.classList.add("is-active");

        applySorting(candleData);
        onChange();
    });

    sortDir.addEventListener("click", () =>
    {
        const currentOrder = sortDir.getAttribute("data-order");

        if (currentOrder === "asc")
        {
            sortDir.setAttribute("data-order", "desc");
            sortIcon.classList.remove("fa-arrow-up");
            sortIcon.classList.add("fa-arrow-down");
        }
        else
        {
            sortDir.setAttribute("data-order", "asc");
            sortIcon.classList.remove("fa-arrow-down");
            sortIcon.classList.add("fa-arrow-up");
        }

        applySorting(candleData);
        onChange();
    });

    applySorting(candleData);
}

export function applySorting(candleData)
{
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir  = document.getElementById("sort-direction");

    const attribute = sortAttr.value;
    const order     = sortDir.getAttribute("data-order");

    candleData.sort((a, b) =>
    {
        if (attribute === "default")
        {
            const idA = a.ID;
            const idB = b.ID;

            const isNumA = !isNaN(parseFloat(idA)) && isFinite(idA);
            const isNumB = !isNaN(parseFloat(idB)) && isFinite(idB);

            if (!isNumA && isNumB) return -1;
            if (isNumA && !isNumB) return 1;

            if (!isNumA && !isNumB)
            {
                return String(idA).localeCompare(String(idB));
            }

            return parseFloat(idA) - parseFloat(idB);
        }

        if (attribute === "weight")
        {
            const valA = parseFloat(a.TotalWeight) || 0;
            const valB = parseFloat(b.TotalWeight) || 0;
            return valA - valB;
        }

        const valA = (a.Name || "").toLowerCase();
        const valB = (b.Name || "").toLowerCase();
        return valA.localeCompare(valB);
    });

    if (order === "desc") candleData.reverse();
}
