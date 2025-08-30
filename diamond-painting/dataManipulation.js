const dpDisplay = document.getElementById("display");

function updateDpDisplay() {
    dpDisplay.innerHTML = "";

    diamondData.forEach(dp => 
    {
        dpDisplay.innerHTML += `Hello ${dp.Name}<br>`; // Append each name to innerHTML
    });
}
