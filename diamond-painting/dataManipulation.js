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
            img.src = imageUrl;
            card.appendChild(img);

            //Scale image setting
            const scaleFactor = 10;

            img.style.width = `${Number(dp.Width) * scaleFactor}px`;
            img.style.height = `${Number(dp.Height) * scaleFactor}px`;
        }

        console.log(card);
        dpDisplay.appendChild(card);
    });
}
