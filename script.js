// =====================
// Karte initialisieren
// =====================
const map = L.map("map").setView([47.3769, 8.5417], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// =====================
// Variablen
// =====================
let markers = [];
let userLocation = null;

// =====================
// Hilfsfunktionen
// =====================
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Entfernung (km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// =====================
// Bewertungen (localStorage)
// =====================
function getRatings(restaurantId) {
  return JSON.parse(localStorage.getItem("ratings_" + restaurantId)) || [];
}

function addRating(restaurantId, value) {
  const ratings = getRatings(restaurantId);
  ratings.push(value);
  localStorage.setItem("ratings_" + restaurantId, JSON.stringify(ratings));
}

function getAverageRating(restaurantId) {
  const ratings = getRatings(restaurantId);
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

// =====================
// Live-Standort
// =====================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("📍 Dein Standort")
      .openPopup();

    map.setView([userLocation.lat, userLocation.lng], 14);
  });
}

// =====================
// Daten laden
// =====================
fetch("restaurants.json")
  .then(res => res.json())
  .then(data => window.restaurantData = data);

// =====================
// Suche + Sortierung
// =====================
function searchFood() {
  if (!window.restaurantData) return;

  const query = document.getElementById("searchInput").value.toLowerCase();
  const sortType = document.getElementById("sortSelect").value;
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";
  clearMarkers();

  let results = window.restaurantData
    .filter(item => item.dish_name.toLowerCase().includes(query))
    .map(item => {
      const distance = userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
        : Infinity;

      const avgRating = getAverageRating(item.restaurant_id);

      return { ...item, distance, avgRating };
    });

  // 🔍 SORTIEREN
  if (sortType === "distance") {
    results.sort((a, b) => a.distance - b.distance);
  } else if (sortType === "rating") {
    results.sort((a, b) => b.avgRating - a.avgRating);
  }

  const bounds = [];

  results.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>🍽️ ${item.dish_name}</p>
      <p>💰 ${item.price.toFixed(2)} €</p>
      <p>📏 ${item.distance.toFixed(2)} km</p>
      <p>
  ⭐ ${item.avgRating.toFixed(1)} / 5 
  (${getRatings(item.restaurant_id).length} Bewertungen)
</p>

      <label>Bewerten:</label>
      <select onchange="rate(${item.restaurant_id}, this.value)">
        <option value="">–</option>
        <option value="1">1 ⭐</option>
        <option value="2">2 ⭐⭐</option>
        <option value="3">3 ⭐⭐⭐</option>
        <option value="4">4 ⭐⭐⭐⭐</option>
        <option value="5">5 ⭐⭐⭐⭐⭐</option>
      </select>
    `;

    resultsDiv.appendChild(card);

    const marker = L.marker([item.lat, item.lng])
      .addTo(map)
      .bindPopup(
        `<strong>${item.name}</strong><br>
         ⭐ ${item.avgRating.toFixed(1)}<br>
         📏 ${item.distance.toFixed(2)} km`
      );

    markers.push(marker);
    bounds.push([item.lat, item.lng]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

// =====================
// Bewertung abgeben
// =====================
function rate(restaurantId, value) {
  addRating(restaurantId, Number(value));
  searchFood();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
