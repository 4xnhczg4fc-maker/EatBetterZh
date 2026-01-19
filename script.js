alert("script.js geladen");
// =====================
// Karte
// =====================
const map = L.map("map").setView([47.3769, 8.5417], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let markers = [];
let userLocation = null;
let routeControl = null;

// =====================
// Hilfsfunktionen
// =====================
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }
}

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
// Bewertungen
// =====================
function getRatings(id) {
  return JSON.parse(localStorage.getItem("ratings_" + id)) || [];
}

function addRating(id, value) {
  const r = getRatings(id);
  r.push(value);
  localStorage.setItem("ratings_" + id, JSON.stringify(r));
}

function getAverageRating(id) {
  const r = getRatings(id);
  if (r.length === 0) return 0;
  return r.reduce((a, b) => a + b, 0) / r.length;
}

// =====================
// Favoriten
// =====================
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function toggleFavorite(id) {
  let favs = getFavorites();
  favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem("favorites", JSON.stringify(favs));
  searchFood();
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

// =====================
// Standort
// =====================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    L.marker([userLocation.lat, userLocation.lng])
      .addTo(map)
      .bindPopup("📍 Dein Standort");

    map.setView([userLocation.lat, userLocation.lng], 14);
  });
}

// =====================
// Daten laden
// =====================
fetch("restaurants.json")
  .then(r => r.json())
  .then(d => window.restaurantData = d);

// =====================
// Suche
// =====================
function searchFood() {
  if (!window.restaurantData) return;

  const query = document.getElementById("searchInput").value.toLowerCase();
  const sortType = document.getElementById("sortSelect").value;
  const favFilter = document.getElementById("favoriteFilter").value;
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";
  clearMarkers();

  let results = window.restaurantData
    .filter(r => r.dish_name.toLowerCase().includes(query))
    .map(r => ({
      ...r,
      distance: userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng)
        : Infinity,
      avgRating: getAverageRating(r.restaurant_id)
    }));

  if (favFilter === "favorites") {
    results = results.filter(r => isFavorite(r.restaurant_id));
  }

  if (sortType === "distance") {
    results.sort((a, b) => a.distance - b.distance);
  } else {
    results.sort((a, b) => b.avgRating - a.avgRating);
  }

  results.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>
        ${item.name}
        <span onclick="toggleFavorite(${item.restaurant_id})" style="cursor:pointer">
          ${isFavorite(item.restaurant_id) ? "❤️" : "🤍"}
        </span>
      </h3>

      <p>🍽️ ${item.dish_name}</p>
      <p>💰 ${item.price.toFixed(2)} €</p>
      <p>📏 ${item.distance.toFixed(2)} km</p>
      <p>⭐ ${item.avgRating.toFixed(1)} (${getRatings(item.restaurant_id).length})</p>

      <div class="stars">
        ${[1,2,3,4,5].map(n =>
          `<span class="star" onclick="rate(${item.restaurant_id}, ${n})">★</span>`
        ).join("")}
      </div>

      <button onclick="showRoute(${item.lat}, ${item.lng})">
        🗺️ Route anzeigen
      </button>
    `;

    resultsDiv.appendChild(card);

    const marker = L.marker([item.lat, item.lng]).addTo(map);
    markers.push(marker);
  });
}

// =====================
// Aktionen
// =====================
function rate(id, value) {
  addRating(id, value);
  searchFood();
}

function showRoute(lat, lng) {
  if (!userLocation) {
    alert("Standort nicht verfügbar");
    return;
  }

  if (routeControl) map.removeControl(routeControl);

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(lat, lng)
    ],
    show: false
  }).addTo(map);
}

// =====================
// PWA
// =====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
