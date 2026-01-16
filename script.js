// === "Datenbank" ===
const restaurants = [
  {
    name: "Burger Palace",
    menu: [
      { item: "Burger", price: 8.99 },
      { item: "Cheeseburger", price: 9.99 }
    ]
  },
  {
    name: "Pizza House",
    menu: [
      { item: "Pizza Margherita", price: 7.50 },
      { item: "Burger", price: 10.50 }
    ]
  },
  {
    name: "Street Food Spot",
    menu: [
      { item: "Vegan Burger", price: 11.00 }
    ]
  }
];

// === Suchfunktion ===
function searchFood() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";

  restaurants.forEach(restaurant => {
    restaurant.menu.forEach(dish => {
      if (dish.item.toLowerCase().includes(query)) {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <h3>${restaurant.name}</h3>
          <p>🍽️ ${dish.item}</p>
          <p>💰 ${dish.price.toFixed(2)} €</p>
        `;

        resultsDiv.appendChild(card);
      }
    });
  });

  if (resultsDiv.innerHTML === "") {
    resultsDiv.innerHTML = "<p>Keine Ergebnisse gefunden.</p>";
  }
}
