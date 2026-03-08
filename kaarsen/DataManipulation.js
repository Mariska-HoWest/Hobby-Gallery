// /Hobby-Gallery/kaarsen/dataManipulation.js
window.initCandleManipulation = function (data) 
{
  console.log('🟢 initCandleManipulation received:', Array.isArray(data) ? data.length : 0, 'rows');

  UpdateCandleDisplay(data);
};

function UpdateCandleDisplay(data)
{
  const display = document.getElementById('display');

  //Card creation
  data.forEach((candle =>
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