const floats = [];
const location_set = new Set()

function fitsFilter(float, yearQuery = null, locationQuery = null, areaQuery = null) {
  if (yearQuery.length != 0) {
    // Split for each year and convert to Number
    var years = yearQuery.map((year) => Number(year));

    // If the floats year doesn't match any of the years, return false.
    if (!years.some((year) => year == float.year)) {
      return false;
    }
  }

  if (locationQuery.length != 0) {
    if (!locationQuery.some((location) => location === float.location)) {
      return false;
    }
  }

  if (areaQuery.length != 0) {
    if (!areaQuery.some((area) => area === float.area)) {
      return false;
    }
  }

  return true;
}

function filteredMarkers(floats) {
  floats.forEach((float) => {
    var year = new URLSearchParams(window.location.search).getAll("year");
    var location = new URLSearchParams(window.location.search).getAll(
      "location"
    );
    var area = new URLSearchParams(window.location.search).getAll(
      "area"
    );
    float.marker.setVisible(fitsFilter(float, year, location, area));
  });
}

function separateMarkerLocations(float) {
  float_lng = float.lng
  float_lat = float.lat
  while (location_set.has(`${float_lng},${float_lat}`)){
    float_lng += getRandomArbitrary(-0.001, 0.001)
    float_lat += getRandomArbitrary(-0.001, 0.001)
  }
  location_set.add(`${float_lng},${float_lat}`)
  return [float_lat, float_lng]
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Initialize and add the map
function initMap() {
  // Fetch API key

  // Bounding Box:
  const BLOCK_ISLAND_BOUNDS = {
    north: 41.24162890366205,
    south: 41.13566507815083,
    west: -71.6418874330461,
    east: -71.52412773291853,
  };

  // Center of the island
  const block_island = { lat: 41.17991305295885, lng: -71.57982419748356 };
  // The map, centered at Block Island
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: block_island,
    restriction: {
      latLngBounds: BLOCK_ISLAND_BOUNDS,
      strictBounds: false,
    },
    gestureHandling: "greedy",
  });

  fetch("/glass-float-map/db/floats.json", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((float) => {
        lat_lng = separateMarkerLocations(float)
        let marker = new google.maps.Marker({
          position: { lat: lat_lng[0], lng: lat_lng[1] },
          map: map,
        });

        marker.addListener("click", () => {
          map.setZoom(16);
          map.setCenter(marker.getPosition());
          new google.maps.InfoWindow({
            content: createContentString(float),
          }).open({
            anchor: marker,
            map,
            shouldFocus: false,
          });
        });

        float.marker = marker;
        floats.push(float);
      });
      filteredMarkers(floats);
      populateLocationSelections(floats);
      populateAreaSelections(floats);
    });
}

function createContentString(float) {
  let prologue = '<div id="content">' + '<div id="siteNotice">' + "</div>";
  let locationHeader =
    '<h1 id="firstHeading" class="firstHeading" style="margin-bottom:-15px">' +
    float.location +
    "</h1>";
  let numberHeader =
    '<div style="clear=both"> <h2 id="secondHeading" class="secondHeading" style="margin-bottom:5px"><span style="color: #404040">#' +
    float.num +
    '</span><span style="color: #8a8a8a"> - ' +
    float.year +
    "</span></h2></div>";
  let body = '<div id="bodyContent">' 
  if (float.description != null) {
    body += float.description
  }
  body += "</div>";
  let year =
    '<div style="text-align: right">found by ' + float.author + "</div>";
  let end = "</div>";
  return prologue + locationHeader + numberHeader + body + year + end;
}

function removeFilter(param, filter) {
  paramRemove(param, filter);
  filteredMarkers(floats);
}

function addFilter(param, filter) {
  paramAdd(param, filter);
  filteredMarkers(floats);
}

function checkboxChange(element) {
  checked = element.checked;
  if (checked) {
    paramAdd("year", element.value);
  } else {
    paramRemove("year", element.value);
  }
  filteredMarkers(floats);
}

function paramAdd(key, value) {
  params = new URLSearchParams(window.location.search);
  params.append(key, value);
  window.history.replaceState("", "JEFF", `${location.pathname}?${params}`);
}

function paramRemove(key, value) {
  params = new URLSearchParams(window.location.search);
  values = params.getAll(key);
  params.delete(key);
  values
    .filter((filterValue) => filterValue != value)
    .forEach((filterValue) => params.append(key, filterValue));
  window.history.replaceState("", "JEFF", `${location.pathname}?${params}`);
}

function addLocationFilter(element) {
  selectedOption = element[element.selectedIndex];
  value = element.value;
  selectedOption.remove();
  container = document.getElementById("locationContainer");
  child = document.createElement("div");
  child.innerHTML =
    value +
    "<span class='locationDelete'><i class='fas fa-times' onclick='removeLocationFilter(this)'></i></span>";
  addFilter("location", value);
  container.appendChild(child);
}

function removeAreaFilter(element) {
  element = element.parentElement.parentElement;
  var option = document.createElement("option");
  option.text = element.textContent;
  option.value = element.textContent;
  document.getElementById("areaFormSelect").appendChild(option);
  removeFilter("area", element.textContent);
  element.remove();
}

function addAreaFilter(element) {
  selectedOption = element[element.selectedIndex];
  value = element.value;
  selectedOption.remove();
  container = document.getElementById("areaContainer");
  child = document.createElement("div");
  child.innerHTML =
    value +
    "<span class='locationDelete'><i class='fas fa-times' onclick='removeAreaFilter(this)'></i></span>";
  addFilter("area", value);
  container.appendChild(child);
}

function removeLocationFilter(element) {
  element = element.parentElement.parentElement;
  var option = document.createElement("option");
  option.text = element.textContent;
  option.value = element.textContent;
  document.getElementById("locationFormSelect").appendChild(option);
  removeFilter("location", element.textContent);
  element.remove();
}

function populateLocationSelections(floats) {
  locations = [];
  floats.forEach((float) => {
    if (!locations.includes(float.location)) {
      locations.push(float.location);
    }
  });
  locations.sort();
  locations.forEach((location) => {
    var option = document.createElement("option");
    option.text = location;
    option.value = location;
    document.getElementById("locationFormSelect").appendChild(option);
  });
}

function populateAreaSelections(floats) {
  areas = [];
  floats.forEach((float) => {
    if (!areas.includes(float.area)) {
      areas.push(float.area);
    }
  });
  areas.sort();
  areas.forEach((area) => {
    var option = document.createElement("option");
    option.text = area;
    option.value = area;
    document.getElementById("areaFormSelect").appendChild(option);
  });
}

window.initMap = initMap;