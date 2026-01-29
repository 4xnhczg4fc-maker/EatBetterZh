let map, userMarker, directionsService, directionsRenderer;
let userLocation=null;
let markers=[];

// DEMO DATA
const restaurantData=[
 {id:1,name:"Burger Palace",dish:"Burger",price:9,lat:47.377,lng:8.541},
 {id:2,name:"Pizza City",dish:"Pizza",price:12,lat:47.372,lng:8.539},
 {id:3,name:"Cheap Pizza",dish:"Pizza",price:6,lat:47.375,lng:8.545},
 {id:4,name:"Luxury Sushi",dish:"Sushi",price:25,lat:47.379,lng:8.544}
];

// INIT MAP
function initMap(){
 map=new google.maps.Map(document.getElementById("map"),{
  center:{lat:47.3769,lng:8.5417},
  zoom:13,
  styles: darkStyle(),
  disableDefaultUI:true
 });

 directionsService=new google.maps.DirectionsService();
 directionsRenderer=new google.maps.DirectionsRenderer({map});

 liveTracking();
}

// LIVE GPS TRACKING
function liveTracking(){
 navigator.geolocation.watchPosition(pos=>{
  userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};

  if(!userMarker){
   userMarker=new google.maps.Marker({
    position:userLocation,
    map,
    icon:"https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
   });
  } else {
   userMarker.setPosition(userLocation);
  }
 });
}

// SEARCH
function searchFood(){
 const q=document.getElementById("searchInput").value.toLowerCase();
 const sort=document.getElementById("sortSelect").value;
 const resDiv=document.getElementById("results");
 resDiv.innerHTML="";
 markers.forEach(m=>m.setMap(null));
 markers=[];

 let res=restaurantData.filter(r=>r.dish.toLowerCase().includes(q));

 res=res.map(r=>({...r,
 distance:userLocation?dist(userLocation.lat,userLocation.lng,r.lat,r.lng):999,
 rating:getRating(r.id)
 }));

 if(sort=="distance") res.sort((a,b)=>a.distance-b.distance);
 else res.sort((a,b)=>b.rating-a.rating);

 res.forEach(r=>{
  let stars="";
  for(let i=1;i<=5;i++){
   stars+=`<span class="star ${i<=r.rating?'active':''}" onclick="rate(${r.id},${i})">★</span>`;
  }

  const card=document.createElement("div");
  card.className="card";
  card.innerHTML=`
   <b>${r.name}</b><br>
   ${r.dish} ${r.price} CHF<br>
   📏 ${r.distance.toFixed(2)} km ⭐ ${r.rating.toFixed(1)}<br>
   ${stars}<br>
   <button onclick="routeTo(${r.lat},${r.lng})">🧭 Route</button>
  `;
  resDiv.appendChild(card);

  markers.push(new google.maps.Marker({position:{lat:r.lat,lng:r.lng},map}));
 });
}

// ROUTE
function routeTo(lat,lng){
 const mode=document.getElementById("routeMode").value;
 directionsService.route({
  origin:userLocation,
  destination:{lat,lng},
  travelMode:google.maps.TravelMode[mode]
 },(r,s)=>{
  if(s=="OK") directionsRenderer.setDirections(r);
 });
}

// CHEAPEST PIZZA
function findCheapest(){
 const pizzas=restaurantData.filter(r=>r.dish=="Pizza");
 pizzas.sort((a,b)=>a.price-b.price);
 alert("Billigste Pizza: "+pizzas[0].name+" "+pizzas[0].price+" CHF");
}

// RATINGS LOCAL
function rate(id,v){
 let r=JSON.parse(localStorage.getItem("r_"+id))||[];
 r.push(v);
 localStorage.setItem("r_"+id,JSON.stringify(r));
 searchFood();
}
function getRating(id){
 let r=JSON.parse(localStorage.getItem("r_"+id))||[];
 return r.length?r.reduce((a,b)=>a+b)/r.length:0;
}

// DISTANCE
function dist(a,b,c,d){
 const R=6371;
 const dLat=(c-a)*Math.PI/180;
 const dLon=(d-b)*Math.PI/180;
 const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;
 return R*(2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
}

// DARK MODE MAP STYLE
function darkStyle(){
 return [
 {elementType:"geometry",stylers:[{color:"#1d2c4d"}]},
 {elementType:"labels.text.fill",stylers:[{color:"#8ec3b9"}]},
 {elementType:"labels.text.stroke",stylers:[{color:"#1a3646"}]}
 ];
}

// PWA
if("serviceWorker" in navigator){
 navigator.serviceWorker.register("service-worker.js");
}
