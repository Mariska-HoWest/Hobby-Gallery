const dpDisplay = document.getElementById("display");

function updateDpDisplay() {
    dpDisplay.innerHTML = "";

    diamondData.forEach(dp => 
    {
        dpDisplay.innerHTML += `Hello ${dp.name}<br>`; // Append each name to innerHTML
    });
}
