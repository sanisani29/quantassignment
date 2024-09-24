
  // Step 2: Initialize the map
const rendermap = async () => {

 

// Step 7: Add GeoJSON layer
var geojson;  // Declare variable to hold the geojson layer

// var geojsonLayer = L.geoJson.ajax("data/latlong.geo.json");       
const geojsondata = await d3.json("../data/latlong.geo.json");

// get data

// put your API key here;
const apiKey = "WhsDYKiIvEe8LIJLaY27xSNxAo5oY8Mj4g3lkctk";

// search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// constructing the initial search query
// const search =  'mask AND unit_code:"FSG"';
const search = `"Arts of the Islamic World"`;


// array that we will write into
let myArray = [];

// string that will hold the stringified JSON data
let jsonString = '';

let sankey_data = []

// search: fetches an array of terms based on term category
function fetchSearchData(searchTerm) {
  let url = searchBaseURL + "?api_key=" + apiKey + "&q=" + searchTerm;
  console.log(url);
  window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data)

      // constructing search queries to get all the rows of data
      // you can change the page size
      let pageSize = 1000;
      let numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
      console.log(numberOfQueries)
      for (let i = 0; i < numberOfQueries; i++) {
        // making sure that our last query calls for the exact number of rows
        if (i == (numberOfQueries - 1)) {
          searchAllURL = url + `&start=${i * pageSize}&rows=${data.response.rowCount - (i * pageSize)}`;
        } else {
          searchAllURL = url + `&start=${i * pageSize}&rows=${pageSize}`;
        }
        console.log(searchAllURL)
        fetchAllData(searchAllURL);
        console.log(url)
      }
    })
    .catch(error => {
      console.log(error);
    })
}

// fetching all the data listed under our search and pushing them all into our custom array
function fetchAllData(url) {
  window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data)

      data.response.rows.forEach(function (n) {
        addObject(n);
      });
      jsonString += JSON.stringify(myArray);
      console.log("my array", myArray);

      myArray.forEach((arrayItem) => {
        const item_links = []
        arrayItem.type.forEach((type) => {
          item_links.push({
            from: arrayItem.period,
            place: arrayItem.place,
            image: arrayItem.image,
            to: type
          })
        })
        // console.log("Item links: ", item_links);
        item_links.forEach((item) => {
          const foundSourceAndTarget = sankey_data.findIndex((link) => link.place === item.place && link.to === item.to)
          if (foundSourceAndTarget > -1) {
            sankey_data[foundSourceAndTarget] = { ...sankey_data[foundSourceAndTarget], weight: sankey_data[foundSourceAndTarget].weight + 1 }
          } else {
            sankey_data.push({
              from: item.from,
              to: item.to,
              place: item.place,
              weight: 1,
              image: item.image
            })
          }
        })
      })

      console.log("sankey data", sankey_data)
      const filterTypes = [
        "Exhibitions (events)",
        "Journal Article",
        "Smithsonian staff publications",
        "Exhibition catalogs",
        "Conference papers and proceedings",
        "Conferences",
        "Collection descriptions",
        "Electronic information resources"
      ]
      const filteredSankeyData = sankey_data.filter((link) => !filterTypes.includes(link.to) && link.place !== "Unspecified")
      console.log("filtered", filteredSankeyData)

      var map = L.map('map').setView([30, 45], 4);  // Center on the Middle East

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Step 3: Define a color scale
function getColor(d) {
  return d > 40 ? '#800026' :
         d > 25 ? '#BD0026' :
         d > 20 ? '#E31A1C' :
         d > 15 ? '#FC4E2A' :
         d > 10 ? '#FD8D3C' :
         d > 5  ? '#FEB24C' :
         d > 0  ? '#FED976' :
                  '#FFEDA0';
}

// Step 4: Define a style for the choropleth map
function style(feature) {
    // console.log(feature.properties)

    const matches_found = filteredSankeyData.filter((item) => {
        return item.place === feature.properties.name
    })

    console.log("country matches", matches_found)

    const total_artifacts = matches_found.reduce((prev, next) => {

        return prev + next.weight 
    }, 0)

  return {
    fillColor: getColor(total_artifacts),  // Change "value" to the property in your GeoJSON
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.9
  };
}

// Step 5: Add interactivity
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 3,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e, feature) {
  map.fitBounds(e.target.getBounds());
    const match_country = myArray.filter((item) => item.place === feature.properties.name)
    console.log("match country images", match_country)

  const currentPopup = document.getElementById("country-popup")
  if (currentPopup) {
    currentPopup.remove()
  }

  const popUpElement = document.createElement("div")
  const closebutton = document.createElement("button")
  const imageGallery = document.createElement("div")


  popUpElement.setAttribute("id", "country-popup")

popUpElement.style.position = "fixed"

popUpElement.style.top = "50%"

popUpElement.style.left = "50%"

popUpElement.style.transform = "translate(-50%, -50%)"

popUpElement.style.width = "50vw"

popUpElement.style.height = "50vw"

popUpElement.style.borderRadius = "16px"

popUpElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)"

popUpElement.style.color = "white"

popUpElement.style.zIndex = "10000"

popUpElement.innerHTML = `
<h2><font-family: "Times New Roman">${feature.properties.name}</h2>

`
closebutton.innerHTML = "X"
closebutton.onclick= () => document.getElementById("country-popup").remove()
popUpElement.prepend(closebutton)

match_country.forEach((item) => {
    const item_image = document.createElement("img")
    item_image.setAttribute("src", item.image)
    item_image.style.width = "200px"
    item_image.style.aspectRatio = "3/2"
    imageGallery.appendChild(item_image)
})

imageGallery.style.overflow = "scroll"
imageGallery.style.height = "600px"
imageGallery.style.width = "100%"
// imageGallery.style.margin = "0 auto"
imageGallery.style.display = "flex"
imageGallery.style.justifyContent = "center"
imageGallery.style.flexDirection = "column"
imageGallery.style.flexWrap = "wrap"



popUpElement.appendChild(imageGallery); 


document.body.appendChild(popUpElement);
    }

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: (e) => zoomToFeature(e, feature)
  });
}

// Step 6: Add a control to show info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); 
  this.update();
  return this._div;
};

info.update = function (props) {

if (props) {
        const matches_found = filteredSankeyData.filter((item) => {
        return item.place === props.name
    })

    console.log("country matches", matches_found)

    const total_artifacts = matches_found.reduce((prev, next) => {

        return prev + next.weight 
    }, 0)

  this._div.innerHTML = '<h2>At a Glance: Artifacts by Present-Day Countries!</h2>' +  (props ?
  `<b><h3>${props.name}</h3></b><br/>${total_artifacts} artifacts`: 'Hover over a country');
}
};

info.addTo(map);

geojson = L.geoJson(geojsondata, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

    })
    .catch(error => {
      console.log(error)
    })

}


// create your own array with just the data you need
function addObject(objectData) {

  // we've encountered that some places have data others don't
  let currentPlace = "";
  if (objectData.content.indexedStructured.place) {
    currentPlace = objectData.content.indexedStructured.place[0];
  }

  // let date = objectData.content.indexedStructured.date.label
  let objectDate = objectData.content.indexedStructured.date
  let date = objectData.content.freetext.date
  let period = date.find((item) => item.label === "Period")
  let year = date.find((item) => item.label === "Year")
  let type = objectData.content.indexedStructured.object_type
  let place = objectData.content.freetext.place ? objectData.content.freetext.place[0].content : "Unspecified"
  let image = objectData.content.descriptiveNonRepeating?.online_media ? objectData.content.descriptiveNonRepeating.online_media.media[0].resources.find((resource) => resource.label.includes("JPEG")).url : ""
  // console.log(objectData.content.indexedStructured.date)
  // console.log("date, period, year", date, period, year)

  const replacementPeriod = {
    "early 13th century": "Saljuq period",
    "13th century": "Saljuq period",
    "late 13th century": "Saljuq period",
    "12th-13th century": "Saljuq period",
    "12th-13th century?": "Saljuq period",
    "13th-14th century?": "Il-Khanid dynasty",
    "13th-14th century": "Saljuq period",
    "late 12th-early 13th century": "Saljuq period",
    "late12th-early 13th century": "Saljuq period",
    "10th-14th century": "Anytime between Samanid-Il-Khanid",
    "16th century?": "Mughal dynasty",
    "16th-17th century?": "Mughal dynasty",
    "17th-18th century?": "Mughal dynasty",
    "18th century": "Mughal dynasty",
    "Mughal dynasty, Reign of Jahangir": "Mughal dynasty"
  }

  const replacementPlace = {
    "Perhaps Amol, Iran": "Iran",
    "Iran?": "Iran",
    "Probably Iran": "Iran",
    "Probably Shiraz, Iran": "Iran",
    "Possibly Shiraz, Iran": "Iran",
    "Raqqa, Syria": "Syria",
    "Possibly Raqqa, Syria": "Syria",
    "Syria?": "Syria",
    "Probably Istanbul, Turkey": "Turkey",
    "Anatolia, Turkey": "Turkey",
    "Iraq?": "Iraq",
    "Fustat ?, Egypt": "Egypt",
    "Probably Samarqand, Uzbekistan": "Uzbekistan"
  }
  myArray.push({
    period: period?.content || replacementPeriod[date[0].content] || `${date[0]?.content?.slice(0, 1)?.toUpperCase()}${date[0]?.content?.slice(1)}`,
    // period: period?.content || date,
    type,
    place: replacementPlace[place] ? replacementPlace[place] : place,
    image
  })
}


fetchSearchData(search);

}

rendermap();