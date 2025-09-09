const dpDisplay = document.getElementById("display");

//event Listener for hover
function addHoverDelay(element, callback, delay = 750)
{
    let timer;

    element.addEventListener("mouseenter", () => 
    {
        if (!infoToggle.checked)
        {
            timer = setTimeout(() => {
                callback();
            }, delay);
        }
    });

    element.addEventListener("mouseleave", () =>
    {
        if (!infoToggle.checked)
        {
            clearTimeout(timer);
            element.querySelector(".card-inner").classList.remove("flipped");
        }
    });
}

function CreateSideBar()
{
    document.getElementById("infoToggle").addEventListener("change", (e) => 
    {
        const cards = document.querySelectorAll(".card-inner");
        if (e.target.checked)
        {
    cards.forEach((card, index) => {
    setTimeout(() => {
        if (e.target.checked) {
            card.classList.add("flipped");
        } else {
            card.classList.remove("flipped");
        }
    }, index * 25);
});
        }
        else
        {
            cards.forEach(card =>
            {
                card.classList.remove("flipped")
            })
        }
    })
}

//card creation
function updateDpDisplay() 
{
    dpDisplay.innerHTML = "";

    //default card size
    const defaultWidth = 200;
    const defaultHeight = 150;

    diamondData.forEach(dp => 
    {
        let card = document.createElement("div");
        card.classList.add("card");

        let cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");

        let cardFront = document.createElement("div");
        cardFront.classList.add("card-front");

            let name = document.createElement("div");
            name.classList.add("name")
            name.textContent = dp.Name;
            cardFront.appendChild(name)

            if (dp.ImgOriginal)
            {
                let img = document.createElement("img")
                img.classList.add("img")

                const imageUrl = convertDriveLink(dp.ImgOriginal);
                img.src = imageUrl;
                cardFront.appendChild(img);

                //Scale image setting
                const scaleFactor = 5;

                img.style.width = `${Number(dp.Width) * scaleFactor}px`;
                img.style.height = `${Number(dp.Height) * scaleFactor}px`;
                
                if (dp.Height < 30 || dp.Width < 30) //default card if small image
                {
                    cardInner.style.width = `${defaultWidth}px`;
                    cardInner.style.height = `${defaultHeight}px`;
                }
                else
                {
                    cardInner.style.width = img.style.width;
                    cardInner.style.height = `${Number(dp.Height) * scaleFactor + 30}px`;
                }
            }
            else if (dp.ImgFinished)
            {
                let img = document.createElement("img")
                img.classList.add("img")

                const imageUrl = convertDriveLink(dp.ImgFinished);
                img.src = imageUrl;
                cardFront.appendChild(img);

                //Scale image setting
                const scaleFactor = 5;

                img.style.width = `${Number(dp.Width) * scaleFactor}px`;
                img.style.height = `${Number(dp.Height) * scaleFactor}px`;
                
                if (dp.Height < 30 || dp.Width < 30) //default card if small image
                {
                    cardInner.style.width = `${defaultWidth}px`;
                    cardInner.style.height = `${defaultHeight}px`;
                }
                else
                {
                    cardInner.style.width = img.style.width;
                    cardInner.style.height = `${Number(dp.Height) * scaleFactor + 30}px`;
                }
            }
            else
            {
                cardFront.classList.add("no-image");

                // Set default card-inner size for no-image
                cardInner.style.width = `${defaultWidth}px`;
                cardInner.style.height = `${defaultHeight}px`;
            }

        let cardBack = document.createElement("div");
        cardBack.classList.add("card-back");

            let title = document.createElement("div");
            title.classList.add("title")
            title.textContent = dp.Name;
            cardBack.appendChild(title);

            let infoPanel = document.createElement("div");
            infoPanel.classList.add("card-info");

            let cardInfo = `Dimensions: ${dp.Width}x${dp.Height}\nOwner: ${dp.Owner}`;
            if (dp.Comment) 
            {
                cardInfo += `\n Comment: ${dp.Comment}`;
            }
            infoPanel.textContent = cardInfo;
            infoPanel.style.whiteSpace = "pre-wrap";
            cardBack.appendChild(infoPanel);

            let modifierContainer = document.createElement("div");
            modifierContainer.classList.add("modifier-btn-container");

                let modifierAB = document.createElement("div");
                modifierAB.classList.add("modifier-btn");
                modifierAB.textContent = "AB";

                    if(dp.AB === "TRUE") 
                    {
                        modifierAB.style.backgroundColor = "#38005e"; // active color
                        modifierAB.style.color = "white";
                    }
                    else 
                    {
                        modifierAB.style.backgroundColor = "#ccc";     // inactive color
                        modifierAB.style.color = "#666";
                    }
                modifierContainer.appendChild(modifierAB);

                let modifierFD = document.createElement("div");
                modifierFD.classList.add("modifier-btn");
                modifierFD.textContent = "FD";

                    if(dp.FD === "TRUE") 
                    {
                        modifierFD.style.backgroundColor = "#38005e"; // active color
                        modifierFD.style.color = "white";
                    }
                    else 
                    {
                        modifierFD.style.backgroundColor = "#ccc";     // inactive color
                        modifierFD.style.color = "#666";
                    }
                modifierContainer.appendChild(modifierFD);

            cardBack.appendChild(modifierContainer);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        dpDisplay.appendChild(card);

        //hover function - turn cards
        addHoverDelay(card, () =>
        {
            cardInner.classList.add("flipped");
        });

        card.addEventListener("mouseleave", () => 
    {
        if (!infoToggle.checked)
        {
            clearTimeout(timer);
            element.querySelector(".card-inner").classList.remove("flipped");
        }
    });

    });
}
