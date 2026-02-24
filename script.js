let map;
let userMarker;
let restaurants = [];
let markers = [];

const restaurantData = [
  { name: "Pizza City", type: "Pizza", price: 12, rating: 4.9, coords: [8.5417, 47.3769] },
  { name: "Cheap Pizza", type: "Pizza", price: 6, rating: 2.0, coords: [8.55, 47.37] },
  { name: "Burger House", type: "Burger", price: 15, rating: 4.5, coords: [8.53, 47.38] },
  { name: "Sushi Master", type: "Sushi", price: 25, rating: 4.8, coords: [8.52, 47.375] }
];

function initMap(userLocation) {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: userLocation,
    zoom: 13
  });

  map.addControl(new maplibregl.NavigationControl());

  userMarker = new maplibregl.Marker({ color: "cyan" })
    .setLngLat(userLocation)
    .addTo(map);
}

function loadRestaurants() {
  restaurantData.forEach(r => {
    const marker = new maplibregl.Marker()
      .setLngLat(r.coords)
      .setPopup(new maplibregl.Popup().setHTML(
        `<strong>${r.name}</strong><br>
         ${r.type}<br>
         ${r.price} CHF<br>
         ⭐ ${r.rating}`
      ))
      .addTo(map);

    markers.push(marker);
  });
}

function searchRestaurants() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const filtered = restaurantData.filter(r =>
    r.type.toLowerCase().includes(query)
  );

  filtered.forEach(r => {
    resultsDiv.innerHTML += `
      <div class="result-card">
        <strong>${r.name}</strong><br>
        ${r.price} CHF • ⭐ ${r.rating}
      </div>
    `;
  });
}

function findCheapest() {
  const cheapest = restaurantData.reduce((a, b) => a.price < b.price ? a : b);
  alert("💸 Billigste Option: " + cheapest.name + " (" + cheapest.price + " CHF)");
}

navigator.geolocation.getCurrentPosition(
  position => {
    const userLocation = [position.coords.longitude, position.coords.latitude];
    initMap(userLocation);
    loadRestaurants();
  },
  () => {
    const fallback = [8.5417, 47.3769]; // Zürich
    initMap(fallback);
    loadRestaurants();
  }
);
