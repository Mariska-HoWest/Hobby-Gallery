const dpDisplay = document.getElementById("display");
console.log(dpDisplay);

function updateDpDisplay() {
    dpDisplay.innerHTML = "";

    diamondData.forEach(dp => 
    {
        let card = document.createElement("div");
        card.classList.add("card");

        let name =document.createElement("div");
        name.classList.add("name")
        name.textContent = dp.Name;
        card.appendChild(name)

        if (dp.Image)
        {
            let img = document.createElement("img")
            img.classList.add("img")

            const imageUrl = convertDriveLink(dp.Image);
            img.src = dp.Image;
            card.appendChild(img);

            //Scale image setting
            const scaleFactor = 1;

            img.style.width = `${Number(dp.Width) * scaleFactor}px`;
            img.style.height = `${Number(dp.Height) * scaleFactor}px`;
        }

        dpDisplay.appendChild(card);
    });
}
