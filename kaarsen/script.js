// Candle data
const candleData = [
    {
        name: "Rose Garden",
        image: "/Hobby-Gallery/kaarsen/images/rose-garden.jpg",
        weight: "200g",
        diameter: "8cm",
        quantity: 5
    },
    {
        name: "Lavender Dream",
        image: "/Hobby-Gallery/kaarsen/images/lavender-dream.jpg",
        weight: "250g",
        diameter: "8cm",
        quantity: 3
    },
    {
        name: "Vanilla Bliss",
        image: "/Hobby-Gallery/kaarsen/images/vanilla-bliss.jpg",
        weight: "200g",
        diameter: "7cm",
        quantity: 4
    }
];

// Generate candle cards
function generateCandleCards() {
    const container = document.getElementById('candle-container');
    candleData.forEach(candle => {
        const card = document.createElement('div');
        card.className = 'candle-card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${candle.image}" alt="${candle.name}" onerror="this.src='/Hobby-Gallery/kaarsen/images/placeholder.jpg'">
            </div>
            <div class="card-info">
                <h3 class="card-title">${candle.name}</h3>
                <p class="info-row"><span class="label">Weight:</span> <span class="value">${candle.weight}</span></p>
                <p class="info-row"><span class="label">Diameter:</span> <span class="value">${candle.diameter}</span></p>
                <p class="info-row"><span class="label">Quantity:</span> <span class="value">${candle.quantity}</span></p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', generateCandleCards);