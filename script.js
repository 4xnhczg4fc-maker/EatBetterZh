let map, directionsService, directionsRenderer;
let userLocation;
let markers = [];

// ================= MAP =================
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.3769, lng: 8.5417 },
    zoom: 14,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  // Standort
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#007aff",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "white"
      }
    });

    map.setCenter(userLocation);
  });
}

window.onload = initMap;

// ================= DATA =================
fetch("restaurants.json")
  .then(r => r.json())
  .then(d => window.restaurantData = d);

// ================= RATING =================
function getRatings(id) {
  return JSON.parse(localStorage.getItem("ratings_" + id)) || [];
}

function addRating(id, v) {
  const r = getRatings(id);
  r.push(v);
  localStorage.setItem("ratings_" + id, JSON.stringify(r));
}

function avgRating(id) {
  const r = getRatings(id);
  if (!r.length) return 0;
  return r.reduce((a,b)=>a+b,0)/r.length;
}

// ================= FAVORITES =================
function getFavs() {
  return JSON.parse(localStorage.getItem("favs")) || [];
}
function toggleFav(id) {
  let f = getFavs();
  f = f.includes(id) ? f.filter(x=>x!==id) : [...f,id];
  localStorage.setItem("favs", JSON.stringify(f));
  searchFood();
}
function isFav(id){return getFavs().includes(id);}

// ================= SEARCH =================
function searchFood() {
  const q = searchInput.value.toLowerCase();
  const resultsDiv = results;
  resultsDiv.innerHTML = "";

  markers.forEach(m => m.setMap(null));
  markers = [];

  window.restaurantData
    .filter(r => r.dish_name.toLowerCase().includes(q))
    .forEach(r => {
      const avg = avgRating(r.restaurant_id).toFixed(1);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <b>${r.name}</b> ${isFav(r.restaurant_id)?"❤️":"🤍"}
        <br>${r.dish_name} – ${r.price} CHF
        <br>⭐ ${avg}
        <div>
          ${[1,2,3,4,5].map(n=>`<span class="star" onclick="rate(${r.restaurant_id},${n})">★</span>`).join("")}
        </div>
        <button onclick="routeTo(${r.lat},${r.lng})">🗺️ Route</button>
        <button onclick="toggleFav(${r.restaurant_id})">❤️ Favorit</button>
      `;
      resultsDiv.appendChild(card);

      const marker = new google.maps.Marker({
        position: {lat:r.lat,lng:r.lng},
        map,
        title: r.name
      });
      markers.push(marker);
    });
}

// ================= RATE =================
function rate(id, v) {
  addRating(id, v);
  searchFood();
}

// ================= ROUTE =================
function routeTo(lat,lng) {
  const mode = routeMode.value;

  directionsService.route({
    origin: userLocation,
    destination: {lat,lng},
    travelMode: google.maps.TravelMode[mode]
  }, (res, status)=>{
    if(status==="OK"){
      directionsRenderer.setDirections(res);
    }
  });
}
