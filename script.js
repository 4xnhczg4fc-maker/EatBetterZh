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
let userMarker = null;
let userLocation = null;

// =====================
// Hilfsfunktionen
// =====================

// Marker löschen
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Entfernung berechnen (Haversine-Formel)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =====================
// Live-Standort holen
// =====================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      userMarker = L.marker([userLocation.lat, userLocation.lng])
        .addTo(map)
        .bindPopup("📍 Dein Standort")
        .openPopup();

      map.setView([userLocation.lat, userLocation.lng], 14);
    },
    () => {
      alert("Standort konnte nicht ermittelt werden.");
    }
  );
} else {
  alert("Geolocation wird nicht unterstützt.");
}

// =====================
// Daten laden
// =====================
fetch("restaurants.json")
  .then(res => res.json())
  .then(data => {
    window.restaurantData = data;
    console.log("Restaurants geladen:", data);
  });

// =====================
// Suche
// =====================
function searchFood() {
  if (!window.restaurantData) {
    alert("Daten werden noch geladen, bitte kurz warten.");
    return;
  }

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

  const bounds = [];

  if (userLocation) {
    bounds.push([userLocation.lat, userLocation.lng]);
  }

  filtered.forEach(item => {
    // Entfernung berechnen
    let distanceText = "Entfernung unbekannt";
    if (userLocation) {
      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        item.lat,
        item.lng
      );
      distanceText = `${distance.toFixed(2)} km entfernt`;
    }

    // Ergebnisliste
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>🍽️ ${item.dish_name}</p>
      <p>💰 ${item.price.toFixed(2)} €</p>
      <p>📏 ${distanceText}</p>
    `;
    resultsDiv.appendChild(card);

    // Marker
    const marker = L.marker([item.lat, item.lng])
      .addTo(map)
      .bindPopup(
        `<strong>${item.name}</strong><br>
         ${item.dish_name}<br>
         ${item.price.toFixed(2)} €<br>
         ${distanceText}`
      );

    markers.push(marker);
    bounds.push([item.lat, item.lng]);
  });

  // Karte auf alles zoomen
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}
