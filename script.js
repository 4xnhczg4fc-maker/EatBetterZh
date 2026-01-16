const map = L.map("map").setView([47.3769, 8.5417], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let markers = [];

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

fetch("restaurants.json")
  .then(res => res.json())
  .then(data => {
    window.restaurantData = data;
  });

function searchFood() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";
  clearMarkers();

  const filtered = window.restaurantData.filter(item =>
    item.dish_name.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<p>Keine Ergebnisse gefunden.</p>";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.dish_name} – ${item.price} €</p>
    `;
    resultsDiv.appendChild(card);

    const marker = L.marker([item.lat, item.lng])
      .addTo(map)
      .bindPopup(`${item.name}<br>${item.dish_name}`);

    markers.push(marker);
  });

  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.2));
}
