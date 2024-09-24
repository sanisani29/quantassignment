anychart.onDocumentReady(function(){
 //creating the data
 let sankey_data = []

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
        // console.log("Item links: ", item_links);
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
      const filteredSankeyData = sankey_data.filter((link) => !filterTypes.includes(link.to))

      //calling the Sankey function
var sankey_chart = anychart.sankey(filteredSankeyData);
//customizing the width of the nodes
sankey_chart.nodeWidth("20%");
// configure labels
sankey_chart.node().labels().useHtml(true);
sankey_chart.node().labels().format(
  "<span style='font-size: 10px; display: block; padding: 5px 0;'>{%name}</span>"
);
sankey_chart.node().tooltip().useHtml(true);
sankey_chart.node().tooltip().format(
    "<span style='font-size: 10px; display: block; padding: 5px 0; color: red;'>{%name}</span>"
)
//setting the chart title
sankey_chart.title("Artifact Contribution by Empire");
//customizing the vertical padding of the nodes
sankey_chart.nodePadding(5);
//setting the container id
sankey_chart.container("container");
//initiating drawing the Sankey diagram
sankey_chart.draw();

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
    "10th-14th century": "Samanid/Il-Khanid",
    "16th century?": "Mughal dynasty, Reign of Jahangir",
    "16th-17th century?": "Mughal dynasty, Reign of Jahangir",
    "17th-18th century?": "Mughal dynasty, Reign of Jahangir",
    "18th century": "Mughal dynasty, Reign of Jahangir",
    "circa 900-1400": "Byzantine Empire",
    "9th century": "Spanish Umayyads",
    "8th-9th century": "Spanish Umayyads",
    "15th century?": "Unidentifiable",
    "15th-16th century?": "Unidentifiable",
    "16th century": "Unidentifiable",
    "1650-1700": "Ottoman empire",
    "18th century (?)": "Ottoman empire",
    "11th-12th century": "Almohads",
    "12th century?": "Almohads",
    "14th century?": "Ottoman empire",
    "ottoman period": "Ottoman empire",
    "14th-15th century?": "Ottoman empire",
    "1983": "Post-Mughal",
    "2022": "Post-Mughal"
  }
  myArray.push({
    period: period?.content || replacementPeriod[date[0].content] || `${date[0]?.content?.slice(0, 1)?.toUpperCase()}${date[0]?.content?.slice(1)}`,
    // period: period?.content || date,
    type
  })
}


fetchSearchData(search);

});
