// =====================
// Google Map starten
// =====================
let map, userMarker, directionsService, directionsRenderer;
let userLocation = null;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.3769, lng: 8.5417 },
    zoom: 13,
    mapTypeControl: false,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false
  });

  getUserLocation();
}

// =====================
// Standort holen
// =====================
function getUserLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    userMarker = new google.maps.Marker({
      position: userLocation,
      map: map,
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    map.setCenter(userLocation);
  });
}

// =====================
// Testdaten
// =====================
const restaurantData = [
 {restaurant_id:1,name:"Burger Palace",dish_name:"Burger",price:8.9,lat:47.377,lng:8.541},
 {restaurant_id:2,name:"Pizza City",dish_name:"Pizza",price:12.5,lat:47.372,lng:8.539}
];

let markers = [];

// =====================
// Hilfsfunktionen
// =====================
function getDistanceKm(a,b,c,d){
 const R=6371;
 const dLat=(c-a)*Math.PI/180;
 const dLon=(d-b)*Math.PI/180;
 const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;
 return R*(2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
}

// =====================
// Ratings + Favorites
// =====================
function getRatings(id){return JSON.parse(localStorage.getItem("r_"+id))||[];}
function rate(id,v){let r=getRatings(id);r.push(v);localStorage.setItem("r_"+id,JSON.stringify(r));searchFood();}
function avgRating(id){let r=getRatings(id);return r.length? r.reduce((a,b)=>a+b,0)/r.length:0;}

function getFav(){return JSON.parse(localStorage.getItem("fav"))||[];}
function toggleFav(id){let f=getFav();f=f.includes(id)?f.filter(x=>x!=id):[...f,id];localStorage.setItem("fav",JSON.stringify(f));searchFood();}
function isFav(id){return getFav().includes(id);}

// =====================
// Suche + Anzeige
// =====================
function searchFood(){
 const q=document.getElementById("searchInput").value.toLowerCase();
 const sort=document.getElementById("sortSelect").value;
 const favFilter=document.getElementById("favoriteFilter").value;
 const resDiv=document.getElementById("results");
 resDiv.innerHTML="";
 markers.forEach(m=>m.setMap(null));
 markers=[];

 let res=restaurantData.filter(r=>r.dish_name.toLowerCase().includes(q))
 .map(r=>({...r,
 distance:userLocation?getDistanceKm(userLocation.lat,userLocation.lng,r.lat,r.lng):999,
 rating:avgRating(r.restaurant_id)
 }));

 if(favFilter=="favorites") res=res.filter(r=>isFav(r.restaurant_id));
 if(sort=="distance") res.sort((a,b)=>a.distance-b.distance);
 else res.sort((a,b)=>b.rating-a.rating);

 res.forEach(item=>{
   const card=document.createElement("div");
   card.className="card";

   let stars="";
   for(let i=1;i<=5;i++){
     stars+=`<span class="star ${i<=item.rating?'active':''}" onclick="rate(${item.restaurant_id},${i})">★</span>`;
   }

   card.innerHTML=`
   <b>${item.name}</b> <span onclick="toggleFav(${item.restaurant_id})">${isFav(item.restaurant_id)?"❤️":"🤍"}</span><br>
   ${item.dish_name} - ${item.price} CHF<br>
   ⭐ ${item.rating.toFixed(1)} | 📏 ${item.distance.toFixed(2)} km<br>
   ${stars}<br><br>
   <button onclick="showRoute(lat,lng,'TRANSIT')">🚌 ÖV Route</button>
   <button onclick="showRoute(${item.lat},${item.lng},'WALKING')">🚶 Route</button>
   <button onclick="showRoute(${item.lat},${item.lng},'DRIVING')">🚗 Route</button>
   `;
   resDiv.appendChild(card);

   const marker = new google.maps.Marker({
     position:{lat:item.lat,lng:item.lng},
     map:map,
     title:item.name
   });
   markers.push(marker);
 });
}

// =====================
// GOOGLE MAPS ROUTE (ECHT)
// =====================
function showRoute(lat,lng,mode){
 if(!userLocation){alert("Kein Standort");return;}

 directionsService.route({
   origin:userLocation,
   destination:{lat,lng},
   travelMode: google.maps.TravelMode[mode]
 }, (result,status)=>{
   if(status=="OK"){
     directionsRenderer.setDirections(result);
   } else {
     alert("Route Fehler: "+status);
   }
 });
}
