// Smithsonian API example code
// check API documentation for search here: http://edan.si.edu/openaccess/apidocs/#api-search-search
// Using this data set https://collections.si.edu/search/results.htm?q=Flowers&view=grid&fq=data_source%3A%22Cooper+Hewitt%2C+Smithsonian+Design+Museum%22&fq=online_media_type%3A%22Images%22&media.CC0=true&fq=object_type:%22Embroidery+%28visual+works%29%22

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
            to: type
          })
        })
        console.log("Item links: ", item_links);
        item_links.forEach((item) => {
          const foundSourceAndTarget = sankey_data.findIndex((link) => link.from === item.from && link.to === item.to)
          if (foundSourceAndTarget > -1) {
            sankey_data[foundSourceAndTarget] = { ...sankey_data[foundSourceAndTarget], weight: sankey_data[foundSourceAndTarget].weight + 1 }
          } else {
            sankey_data.push({
              from: item.from,
              to: item.to,
              weight: 1
            })
          }
        })
      })

      console.log("sankey data", sankey_data)
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

  // console.log(objectData.content.indexedStructured.date)
  // console.log("date, period, year", date, period, year)

  myArray.push({
    period: period?.content || "Unidentifiable",
    type,
    date

  })

  // for (let i = 0; i<objectDate.length; i++) {
  //     for (let j = 0; j<type.length; j++) {
  //     myArray.push({
  //      date: objectDate[i],
  //      period: period[i]
  //      type: type[j]
  //       })
  //     }

  // }




}


fetchSearchData(search);
// console.log(myArray)
console.log("new array", myArray)



//---------------------------UNIT CODES------------------------------
// ACAH: Archives Center, National Museum of American History
// ACM: Anacostia Community Museum
// CFCHFOLKLIFE: Smithsonian Center for Folklife and Cultural Heritage
// CHNDM: Cooper-Hewitt, National Design Museum
// FBR: Smithsonian Field Book Project
// FSA: Freer Gallery of Art and Arthur M. Sackler Gallery Archives
// FSG: Freer Gallery of Art and Arthur M. Sackler Gallery
// HAC: Smithsonian Gardens
// HMSG: Hirshhorn Museum and Sculpture Garden
// HSFA: Human Studies Film Archives
// NAA: National Anthropological Archives
// NASM: National Air and Space Museum
// NMAAHC: National Museum of African American History and Culture
// NMAfA: Smithsonian National Museum of African Art
// NMAH: Smithsonian National Museum of American History
// NMAI: National Museum of the American Indian
// NMNHANTHRO: NMNH - Anthropology Dept.
// NMNHBIRDS: NMNH - Vertebrate Zoology - Birds Division
// NMNHBOTANY: NMNH - Botany Dept.
// NMNHEDUCATION: NMNH - Education & Outreach
// NMNHENTO: NMNH - Entomology Dept.
// NMNHFISHES: NMNH - Vertebrate Zoology - Fishes Division
// NMNHHERPS: NMNH - Vertebrate Zoology - Herpetology Division
// NMNHINV: NMNH - Invertebrate Zoology Dept.
// NMNHMAMMALS: NMNH - Vertebrate Zoology - Mammals Division
// NMNHMINSCI: NMNH - Mineral Sciences Dept.
// NMNHPALEO: NMNH - Paleobiology Dept.
// NPG: National Portrait Gallery
// NPM: National Postal Museum
// SAAM: Smithsonian American Art Museum
// SI: Smithsonian Institution, Digitization Program Office
// SIA: Smithsonian Institution Archives
// SIL: Smithsonian Libraries