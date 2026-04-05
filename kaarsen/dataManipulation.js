// =======================
// /Hobby-Gallery/kaarsen/dataManipulation.js
// =======================

let candleData = [];

window.initCandleManipulation = function (data) 
{
  candleData = Array.isArray(data) ? data : [];

  ApplySorting();
};

document.addEventListener("DOMContentLoaded", () =>
{
    SetupCandleFilterButtons();
});

function SetupCandleFilterButtons()
{
    const sortWrapper = document.getElementById("sort-wrapper");
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir = document.getElementById("sort-direction");
    const sortIcon = sortDir.querySelector("i");

    sortAttr.addEventListener("change", () =>
    {
        sortAttr.value === "default" 
            ? sortWrapper.classList.remove("is-active") 
            : sortWrapper.classList.add("is-active");

        ApplySorting();
    });

    sortDir.addEventListener("click", () => 
    {
        const currentOrder = sortDir.getAttribute("data-order");
        
        if (currentOrder === "asc") 
        {
            // Switch to DESC
            sortDir.setAttribute("data-order", "desc");
            sortIcon.classList.remove("fa-arrow-up");
            sortIcon.classList.add("fa-arrow-down");
        } 
        else 
        {
            // Switch to ASC
            sortDir.setAttribute("data-order", "asc");
            sortIcon.classList.remove("fa-arrow-down");
            sortIcon.classList.add("fa-arrow-up");
        }

        ApplySorting();
    });
}

function ApplySorting()
{
    const sortAttr = document.getElementById("sort-attribute");
    const sortDir = document.getElementById("sort-direction");
    
    const attribute = sortAttr.value;
    const order = sortDir.getAttribute("data-order");

    candleData.sort((a, b) => 
    {
        let valA, valB;

        if (attribute === "default") 
        {
            const idA = a.ID;
            const idB = b.ID;

            // Check if numbers
            const isNumA = !isNaN(parseFloat(idA)) && isFinite(idA);
            const isNumB = !isNaN(parseFloat(idB)) && isFinite(idB);

            // Strings to front
            if (!isNumA && isNumB) return -1;
            if (isNumA && !isNumB) return 1;

            // both strings, sort alphabetically
            if (!isNumA && !isNumB) 
            {
                return String(idA).localeCompare(String(idB));
            }

            // both numbers, sort mathematically
            return parseFloat(idA) - parseFloat(idB);
        }

        if (attribute === "weight") 
        {
            valA = parseFloat(a.TotalWeight) || 0;
            valB = parseFloat(b.TotalWeight) || 0;
            return valA - valB;
        } 
        else //Name Sort
        {
            valA = (a.Name || "").toLowerCase();
            valB = (b.Name || "").toLowerCase();
            return valA.localeCompare(valB);
        }
    });

    // if desc, flip array
    if (order === "desc") 
    {
        candleData.reverse();
    }

    UpdateCandleDisplay();
}

function UpdateCandleDisplay()
{
  const display = document.getElementById('display');
  display.innerHTML = "";

  //Card creation
  candleData.forEach((candle =>
    {
      const card = document.createElement('div');
      card.classList.add('card');

      const title = document.createElement('div');
      title.classList.add('title');
      title.textContent = candle.Name;
      card.appendChild(title);

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('img-container');
      const img = document.createElement('img');
      img.classList.add('img');
      img.src = convertDriveLink(candle.Img);
      imgContainer.appendChild(img);
      card.appendChild(imgContainer);

      display.appendChild(card);
    }));
}

