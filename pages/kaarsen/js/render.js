import { convertDriveLink } from '/Hobby-Gallery/shared/components/drive.js';

export function renderCandles(candleData, onCardClick)
{
    const display = document.getElementById("display");
    display.innerHTML = "";

    candleData.forEach((candle, index) =>
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

        card.addEventListener("click", () => onCardClick(index));

        display.appendChild(card);
    });
}
